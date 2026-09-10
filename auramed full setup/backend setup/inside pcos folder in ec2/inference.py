import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import io
import os
import cv2
import base64

# -------------------------------
# 1. MODEL ARCHITECTURE
# -------------------------------
class PCOSVisionModel(nn.Module):
    def __init__(self):
        super(PCOSVisionModel, self).__init__()

        self.resnet = models.resnet50(weights=None)
        num_ftrs = self.resnet.fc.in_features

        self.resnet.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_ftrs, 2)
        )

    def forward(self, x):
        return self.resnet(x)


device = torch.device("cpu")

# Global hooks
gradients = []
activations = []


# -------------------------------
# 2. MODEL LOADING
# -------------------------------
def model_fn(model_dir):

    model = PCOSVisionModel()

    model_path = os.path.join(model_dir, "pcos_vision_model.pth")

    state_dict = torch.load(model_path, map_location=device)

    new_state_dict = {}
    for k, v in state_dict.items():
        name = k.replace("network.", "")
        new_state_dict[name] = v

    model.resnet.load_state_dict(new_state_dict, strict=False)

    model.eval()

    # Hook GradCAM
    final_conv_layer = model.resnet.layer4[-1]

    def save_gradient(grad):
        gradients.append(grad)

    def save_activation(act):
        activations.append(act)

    final_conv_layer.register_forward_hook(
        lambda m, i, o: save_activation(o)
    )

    final_conv_layer.register_full_backward_hook(
        lambda m, i, o: save_gradient(o[0])
    )

    return model


# -------------------------------
# 3. INPUT FUNCTION
# -------------------------------
def input_fn(request_body, content_type):

    if content_type == "image/jpeg" or content_type == "image/png":

        image = Image.open(io.BytesIO(request_body)).convert("RGB")

        preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                [0.485, 0.456, 0.406],
                [0.229, 0.224, 0.225]
            )
        ])

        tensor = preprocess(image).unsqueeze(0)

        return {
            "tensor": tensor,
            "image": image
        }

    raise Exception("Unsupported content type: " + content_type)


# -------------------------------
# 4. PREDICTION FUNCTION
# -------------------------------
def predict_fn(input_data, model):

    global gradients, activations
    gradients = []
    activations = []

    img_tensor = input_data["tensor"]
    original_img = input_data["image"]

    output = model(img_tensor)

    idx = torch.argmax(output).item()

    model.zero_grad()
    output[0, idx].backward()

    pooled_grads = torch.mean(gradients[0], dim=[0, 2, 3])

    acts = activations[0].detach()

    for i in range(acts.shape[1]):
        acts[:, i, :, :] *= pooled_grads[i]

    heatmap = torch.mean(acts, dim=1).squeeze().numpy()
    heatmap = np.maximum(heatmap, 0)
    heatmap /= np.max(heatmap)

    # Convert image
    img_cv = cv2.cvtColor(np.array(original_img), cv2.COLOR_RGB2BGR)
    img_cv = cv2.resize(img_cv, (224, 224))

    heatmap_resized = cv2.resize(heatmap, (224, 224))
    heatmap_colored = cv2.applyColorMap(
        np.uint8(255 * heatmap_resized),
        cv2.COLORMAP_JET
    )

    overlay = cv2.addWeighted(img_cv, 0.6, heatmap_colored, 0.4, 0)

    _, buffer = cv2.imencode(".jpg", overlay)

    encoded_heatmap = base64.b64encode(buffer).decode("utf-8")

    prediction = {
        "class": "PCOS" if idx == 1 else "Healthy",
        "heatmap": encoded_heatmap
    }

    return prediction


# -------------------------------
# 5. OUTPUT FUNCTION
# -------------------------------
def output_fn(prediction, accept):

    if accept == "application/json":

        import json
        return json.dumps(prediction), accept
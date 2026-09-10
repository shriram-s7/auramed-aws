import torch
import timm
from PIL import Image
from torchvision import transforms
import io
import os

class_names = [
    "Dyskeratotic",
    "Koilocytotic",
    "Metaplastic",
    "Parabasal",
    "Normal"
]

def model_fn(model_dir):

    model = timm.create_model(
        "vit_base_patch16_224",
        pretrained=False,
        num_classes=5
    )

    model_path = os.path.join(model_dir, "aura_med_cervical_v1.pth")

    model.load_state_dict(torch.load(model_path, map_location="cpu"))

    model.eval()

    return model


def input_fn(request_body, request_content_type):

    if request_content_type in [
        "image/jpeg",
        "image/png",
        "image/bmp",
        "application/octet-stream"
    ]:

        image = Image.open(io.BytesIO(request_body)).convert("RGB")

        transform = transforms.Compose([
            transforms.Resize((224,224)),
            transforms.ToTensor(),
            transforms.Normalize(
                [0.485,0.456,0.406],
                [0.229,0.224,0.225]
            )
        ])

        img = transform(image).unsqueeze(0)

        return img

    raise Exception("Unsupported content type")


def predict_fn(input_data, model):

    with torch.no_grad():

        outputs = model(input_data)

        probs = torch.softmax(outputs[0], dim=0)

        conf, pred = torch.max(probs, 0)

    return {
        "prediction": class_names[pred.item()],
        "confidence": float(conf)
    }
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import json
import io
import joblib
import pandas as pd

# =========================================================
# MODEL LOADING
# =========================================================

def model_fn(model_dir):

    image_model = models.resnet50(weights=None)
    image_model.fc = nn.Linear(image_model.fc.in_features,1)

    image_model.load_state_dict(
        torch.load(f"{model_dir}/breast_model.pth", map_location="cpu")
    )

    image_model.eval()

    clinical_model = joblib.load(f"{model_dir}/clinical_model.pkl")

    return {
        "image_model": image_model,
        "clinical_model": clinical_model
    }

# =========================================================
# INPUT PROCESSING
# =========================================================

def input_fn(request_body, content_type):

    if content_type in ["image/jpeg", "image/png"]:

        image = Image.open(io.BytesIO(request_body)).convert("RGB")

        attributes = {
            "age": 50,
            "family_history": 0,
            "breast_density": 2,
            "obesity": 0
        }

        return {
            "image": image,
            "attributes": attributes
        }

    raise Exception("Unsupported content type: " + content_type)
# =========================================================
# PREDICTION
# =========================================================

def predict_fn(input_data, model_objects):

    image_model = model_objects["image_model"]
    clinical_model = model_objects["clinical_model"]

    image = input_data["image"]
    attributes = input_data["attributes"]

    transform = transforms.Compose([
        transforms.Resize((224,224)),
        transforms.ToTensor()
    ])

    image_tensor = transform(image).unsqueeze(0)

    # IMAGE MODEL

    with torch.no_grad():

        output = image_model(image_tensor)

        image_score = torch.sigmoid(output).item()

    # CLINICAL MODEL

    # CLINICAL MODEL
    features = pd.DataFrame([attributes])
    
    expected_features = list(clinical_model.feature_names_in_)
    
    print("EXPECTED:", expected_features)
    print("RECEIVED:", list(features.columns))
    
    if set(features.columns) != set(expected_features):
        return {"error": "Feature mismatch: invalid clinical input structure"}
        
    for col in expected_features:
        if col not in features.columns:
            features[col] = 0
            
    features = features[expected_features]

    clinical_score = float(clinical_model.predict_proba(features)[0][1])

    # FUSION ENGINE

    final_score =(0.7* image_score)+(0.3*clinical_score)

    # DIAGNOSIS

    if final_score > 0.6:
        diagnosis = "HIGH RISK OF BREAST CANCER"
    elif final_score > 0.4:
        diagnosis = "MODERATE RISK"
    else:
        diagnosis = "LOW RISK"

    # EXPLANATION ENGINE

    explanation = []

    if image_score > 0.6:
        explanation.append("Suspicious tissue patterns detected in mammogram.")

    if attributes["family_history"] == 1:
        explanation.append("Family history increases cancer probability.")

    if attributes["age"] > 50:
        explanation.append("Age above 50 increases risk.")

    if attributes["breast_density"] >= 3:
        explanation.append("High breast density detected.")

    if attributes["obesity"] == 1:
        explanation.append("Obesity contributes to hormonal risk.")

    # MEDICAL RECOMMENDATION

    if final_score > 0.7:

        recommendation = [
            "Immediate radiologist consultation",
            "Diagnostic mammography",
            "Biopsy if abnormality confirmed"
        ]

    elif final_score > 0.4:

        recommendation = [
            "Repeat screening in 2 months",
            "Ultrasound evaluation",
            "Lifestyle risk reduction"
        ]

    else:

        recommendation = [
            "Routine screening after 2 year",
            "Maintain healthy lifestyle"
        ]

    # RISK TIMELINE

    risk_6_months = min(final_score * 1.10,1)
    risk_1_year = min(final_score * 1.25,1)
    risk_3_year = min(final_score * 1.50,1)

    result = {

        "image_model_score": image_score,
        "clinical_model_score": clinical_score,
        "final_score": final_score,
        "diagnosis": diagnosis,

        "explanation": explanation,

        "recommended_actions": recommendation,

        "risk_timeline": {

            "6_months": round(risk_6_months,3),
            "1_year": round(risk_1_year,3),
            "3_years": round(risk_3_year,3)

        }

    }

    return result

# =========================================================
# OUTPUT FORMAT
# =========================================================

def output_fn(prediction, content_type):

    return json.dumps(prediction), "application/json"
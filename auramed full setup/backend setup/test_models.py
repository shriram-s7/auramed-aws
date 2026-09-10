import os
import sys
from PIL import Image
import io

print("Testing Python environment:", sys.version)

# 1. Test Breast Model
print("\n--- Testing Breast Model ---")
try:
    from breast import inference as breast_inf
    breast_models = breast_inf.model_fn("breast")
    print("Breast models loaded successfully:", list(breast_models.keys()))
    
    img_path = "../test images/breast/bcnew1.jpeg"
    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        patient_data = {
            "breast_density": 2,
            "age": 45,
            "family_history": 0,
            "hormonal_risk": 0,
            "obesity": 0,
            "menopause_status": 0,
            "high_risk_age": 0,
            "density_risk": 0,
            "genetic_risk_score": 0.1,
            "lifestyle_risk": 0,
            "combined_risk_index": 0.1
        }
        res = breast_inf.predict_fn({"image": image, "attributes": patient_data}, breast_models)
        print("Breast prediction result:", res.get("diagnosis"), "Final Score:", res.get("final_score"))
except Exception as e:
    print("Breast test failed:", e)

# 2. Test Cervical Model
print("\n--- Testing Cervical Model ---")
try:
    from cervical import inference as cervical_inf
    cervical_model = cervical_inf.model_fn("cervical")
    print("Cervical model loaded successfully!")
    
    img_path = "../test images/cervical/normal.bmp"
    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        input_data = cervical_inf.input_fn(img_bytes, "image/bmp")
        res = cervical_inf.predict_fn(input_data, cervical_model)
        print("Cervical prediction result:", res)
except Exception as e:
    print("Cervical test failed:", e)

# 3. Test PCOS Model
print("\n--- Testing PCOS Model ---")
try:
    from pcos import inference as pcos_inf
    pcos_model = pcos_inf.model_fn("pcos")
    print("PCOS model loaded successfully!")
    
    img_path = "../test images/pcos/img_0_0.jpg"
    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            img_bytes = f.read()
        input_data = pcos_inf.input_fn(img_bytes, "image/jpeg")
        res = pcos_inf.predict_fn(input_data, pcos_model)
        print("PCOS prediction result:", res.get("class"), "Heatmap length:", len(res.get("heatmap", "")))
except Exception as e:
    print("PCOS test failed:", e)

print("\nAll model tests finished!")

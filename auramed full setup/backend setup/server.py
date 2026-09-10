from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import importlib
from PIL import Image
import io
from pydantic import BaseModel
from typing import Optional, Any, Dict
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load inference modules
try:
    breast_inf = importlib.import_module("breast.inference")
    cervical_inf = importlib.import_module("cervical.inference")
    pcos_inf = importlib.import_module("pcos.inference")

    breast_model = breast_inf.model_fn("breast")
    cervical_model = cervical_inf.model_fn("cervical")
    pcos_model = pcos_inf.model_fn("pcos")
except ImportError as e:
    print(f"Warning: Inference modules not found locally. Models will not load. Error: {e}")
    # Mock models to prevent crashes locally if just testing APIs
    breast_model = None
    cervical_model = None
    pcos_model = None

# --- Patient Session Endpoints ---

class PatientStartRequest(BaseModel):
    patient_id: str
    name: str
    age: str
    phone: str

class PatientSaveRequest(BaseModel):
    patient_id: str
    test_type: str
    model_input: Dict[str, Any]
    prediction: str
    confidence: Optional[Any] = None
    heatmap: Optional[str] = None
    overlay: Optional[str] = None
    overlay_map: Optional[str] = None

@app.post("/patient/start")
def start_session(request: PatientStartRequest):
    return {
        "status": "session_started",
        "patient_id": request.patient_id,
        "timestamp": datetime.datetime.now().isoformat()
    }

# In-memory storage for test results
patient_tests_db = []

@app.post("/patient/test/save")
def save_test(request: PatientSaveRequest):
    record = request.model_dump() if hasattr(request, "model_dump") else request.dict()
    record["timestamp"] = datetime.datetime.now().isoformat()
    patient_tests_db.append(record)
    print(f"Saved test for patient {request.patient_id}: {request.test_type}")
    return {"status": "success", "message": "Test results saved"}

# --- Prediction Endpoints ---

@app.post("/predict/breast")
async def predict_breast(
    file: UploadFile = File(...),
    breast_density: int = Form(...),
    age: int = Form(...),
    family_history: int = Form(...),
    hormonal_risk: int = Form(...),
    obesity: int = Form(...),
    menopause_status: int = Form(...),
    high_risk_age: int = Form(...),
    density_risk: int = Form(...),
    genetic_risk_score: float = Form(...),
    lifestyle_risk: int = Form(...),
    combined_risk_index: float = Form(...),
    patient_id: str = Form(None), 
    patient_name: str = Form(None),
    phone: str = Form(None)
):

    # Read uploaded image
    img_bytes = await file.read()
    image = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    # Clinical patient data
    patient_data = {
        "breast_density": breast_density,
        "age": age,
        "family_history": family_history,
        "hormonal_risk": hormonal_risk,
        "obesity": obesity,
        "menopause_status": menopause_status,
        "high_risk_age": high_risk_age,
        "density_risk": density_risk,
        "genetic_risk_score": genetic_risk_score,
        "lifestyle_risk": lifestyle_risk,
        "combined_risk_index": combined_risk_index
    }

    # Combine image + attributes
    input_data = {
        "image": image,
        "attributes": patient_data
    }

    if breast_model is None:
        return {"diagnosis": "cancer detected", "confidence": 0.95}

    prediction = breast_inf.predict_fn(
        input_data,
        breast_model
    )

    return prediction

@app.post("/predict/cervical")
async def predict_cervical(
    file: UploadFile = File(...),
    patient_id: str = Form(None),
    patient_name: str = Form(None),
    age: str = Form(None),
    phone: str = Form(None)
):
    img = await file.read()

    if cervical_model is None:
        return {"prediction": "Stage 2"}

    input_data = cervical_inf.input_fn(
        img,
        file.content_type
    )

    prediction = cervical_inf.predict_fn(
        input_data,
        cervical_model
    )

    return prediction


@app.post("/predict/pcos")
async def predict_pcos(
    file: UploadFile = File(...),
    patient_id: str = Form(None),
    patient_name: str = Form(None),
    age: str = Form(None),
    phone: str = Form(None)
):
    img = await file.read()

    if pcos_model is None:
        return {"prediction": "PCOS", "confidence": 0.88}

    input_data = pcos_inf.input_fn(
        img,
        file.content_type
    )

    prediction = pcos_inf.predict_fn(
        input_data,
        pcos_model
    )

    return prediction
# AuraMed AWS (ARCHIVED, not maintained)

This repository is an archived reference of the March to September 2026 AWS deployment of an **early version of AuraMed**: a breast / cervical / PCOS image-inference service on EC2 behind API Gateway, with a React frontend on Amplify. It will not be redeployed. The full application lives in the `auramed` repository (s7/auramed).

Everything here is synthetic or demo material.

## Architecture

```
Browser
  -> AWS Amplify (React + Vite + Tailwind, "final frontend")
  -> Amazon API Gateway (HTTP API, route /{proxy+})
  -> EC2 public IP, port 8000 (uvicorn server:app, FastAPI)
  -> 3 inference modules: breast/, cervical/, pcos/ (PyTorch / timm; breast also a scikit-learn clinical model)
  -> in-memory session store (Python dict, lost on restart)
```

CORS is `allow_origins=["*"]`. There is no login, no database and no roles.

## What is NOT implemented

- **DynamoDB**: the reports say results are "structured for forwarding to DynamoDB", but there is no `boto3` and no AWS SDK code anywhere. Storage is an in-memory dict.
- **AWS HealthImaging**: named in the AI ASCEND 2026 deck (`docs/AWSome.pptx`) but absent from code and docs.
- S3, Lambda, IAM policies, ECR, Elastic Beanstalk, security-group configuration: no scripts or text found. If they were configured, the steps are only in screenshots inside the `.docx` files.

## Layout

```
auramed full setup/
  backend setup/        server.py, requirements.txt, steps.txt, test_models.py
    breast/ cervical/ pcos/            inference.py + weights (loaded by server.py via model_fn("breast"), etc.)
    inside * folder in ec2/            the layout to recreate on the EC2 instance
  frontend setup/final frontend/       React app (+ amplify.yml, see below)
  test images/                         manual test images
  run_all.bat, run_backend.bat, run_frontend.bat, howtorun.txt   local run helpers
docs/      setup docs, reports, hackathon decks (see below)
media/     demo videos (git-ignored), screenshots, expected UI screens
archive/   new-temp.bundle  (git history of the former s7/new-temp repo)
```

Paths inside `auramed full setup/` were left unchanged on purpose: `server.py` loads the models by relative folder name (`breast`, `cervical`, `pcos`), and the `.bat` files use paths relative to themselves. `howtorun.txt` uses absolute paths under `F:\PROJECTS\AuraMed\AuraMed-AWS`; adjust them if you move the folder.

Model weights (`*.pth`) are git-ignored and exist only on disk (and on the original EC2 instance). Files loaded:

| Module | File |
|---|---|
| breast | `breast/breast_model.pth`, `breast/clinical_model.pkl` (the `.pkl` is tracked) |
| cervical | `cervical/aura_med_cervical_v1.pth` |
| pcos | `pcos/pcos_vision_model.pth` |

## Hosting steps (from the three setup documents)

The setup docs are short and partly screenshots.

**1. Backend on EC2** (`docs/BACKEND SETUP.docx`, `auramed full setup/backend setup/steps.txt`)
1. Set up the environment (the doc says "setup environment all that"; the instance type, AMI and security group are not stated. See screenshot in `docs/BACKEND SETUP.docx`).
2. Create a folder `auramed-backend` on the instance and `cd` into it.
3. Create the folder structure with the models: `breast/`, `cervical/`, `pcos/`, each with its `inference.py` and weights (copy from `inside breast folder in ec2/` etc.).
4. Create `server.py` (the doc uses `nano`) and paste in the contents of `backend setup/server.py`.
5. Install dependencies from `requirements.txt` (fastapi, uvicorn, python-multipart, pydantic, torch, torchvision, timm, scikit-learn, joblib, pandas, numpy, pillow, opencv-python) in a Python venv and activate it.
6. Run `uvicorn server:app --host 0.0.0.0 --port 8000`.
7. Note the instance's public IP; it goes into API Gateway. Port 8000 must be reachable from API Gateway (security group rule not documented in text).

**2. API Gateway** (`docs/API SETUP.docx`)
1. In Amazon API Gateway create an API.
2. Define routes as shown in the screenshot in `docs/API SETUP.docx`: a proxy route `/{proxy+}`.
3. The integration URL is `http://<EC2 public IP>:8000/{proxy}`.
4. The stage URL is the base URL the frontend uses.

**3. Frontend on Amplify** (`docs/FRONTEND SETUP.docx`)
1. Have the folder ready (`frontend setup/final frontend`).
2. In `src/services/api.js` set the API base URL constant to the API Gateway stage URL (in this copy it reads `VITE_API_BASE_URL`, falling back to a hard-coded URL).
3. Push the frontend folder to GitHub and create an Amplify app connected to that repository; the site builds and opens automatically.
4. Build settings: `amplify.yml` (added from the old s7/new-temp history: `npm install --legacy-peer-deps`, `npm run build`, artifacts from `dist`).

## Backend endpoints (`server.py`)

| Method and path | Purpose |
|---|---|
| `POST /patient/start` | Starts a session (patient_id, name, age, phone), returns a timestamp |
| `POST /patient/test/save` | Stores a test result in the in-memory dict |
| `POST /predict/breast` | Image plus clinical fields (breast_density, age, family_history, hormonal_risk, obesity, menopause_status, high_risk_age, density_risk, genetic_risk_score, lifestyle_risk, combined_risk_index) |
| `POST /predict/cervical` | Image |
| `POST /predict/pcos` | Image |

**Warning:** if the model modules fail to import, `server.py` sets the models to `None` and the predict endpoints return **hard-coded fake results** (breast: "cancer detected" 0.95; cervical: "Stage 2"; PCOS: "PCOS" 0.88). A response is therefore not proof that a model ran.

## docs/

| File | What it is |
|---|---|
| `API SETUP.docx`, `BACKEND SETUP.docx`, `FRONTEND SETUP.docx` | The three setup guides (contain screenshots) |
| `AURAMED_HEALTHCARE_COMPREHENSIVE_SYSTEM_REPORT.txt` | Architecture and API write-up (2026-09-10) |
| `AURAMED_LOCAL_SYSTEM_AND_MODEL_REPORT.txt` | Local system and models (2026-09-10) |
| `AuraMed_Comprehensive_Technical_Project_Document.md` | Technical document (2026-09-19, newest) |
| `AuraMed.docx`, `AuraMed.pdf` | Early project document (2026-03) |
| `AWSome.pptx` | AI ASCEND 2026 hackathon deck |
| `AWS Kyndryl Hackathon.pdf` | Hackathon PDF (image-only, not text-searchable) |

## Frontend variants

`archive/new-temp.bundle` holds the history of the former `new-temp` repository. Compared with the copy in this folder, its `src/services/api.js` hard-codes the API URL with no environment override, and its `vite.config.js` lacks the `server: { port: 5173, host: true }` block. `package.json` is the same. Restore with `git clone archive/new-temp.bundle <dir>`.

A second, different frontend (CSS-modules UI, with its own `amplify.yml`) existed in `new-frontend-auramed-master`; which frontend was actually on Amplify is uncertain.

# Prison Health Analysis System

## Project Overview

The **Prison Health Analysis System** is an AI-powered diagnostic platform designed to streamline and enhance medical and psychological assessments for inmates. This project leverages an ensemble of Deep Learning and Large Language Models (LLMs) to automatically detect visual emotions, diagnose voice stressors, extract text from medical documents, and generate actionable health reports based on patient history.

## System Architecture

The application is structured as a decoupled two-tier architecture:

- **Frontend (Client):** Built with React.js (Vite) offering an interactive dashboard, live-camera diagnostic stepper, and historical review panels.
- **Backend (API):** A robust Flask server functioning as the AI orchestration layer.

### Core AI Pipelines

1. **Initial Evaluation Pipeline:**
   - Captures a live snapshot.
   - **Gender Classification:** Uses HuggingFace's `prithivMLmods/Realistic-Gender-Classification` image classification pipeline.
   - **Facial Emotion Pipeline:** Uses a two-staged approach (Object Detection -> Classification). First, `yolo11n.pt` localizes and crops the human face/body. Second, a custom `best_new.pt` YOLO model categorizes the crop into 9 specialized mental states.

2. **Document OCR Pipeline:**
   - Doctors upload PDF reports and handwritten/printed image prescriptions.
   - The images are sent to a locally hosted **Ollama** instance and processed by the `glm-ocr:latest` model, seamlessly converting documents into digitized strings.

3. **Voice Stress & Questionnaire Pipeline:**
   - Inmates answer a 10-step psychological survey.
   - Audio is recorded dynamically and sent to the backend.
   - Using a custom dynamically quantized PyTorch model (`quantized_emotion_model.pth` using `Wav2Vec2ForSequenceClassification`), the system identifies stress markers or emotional intent from the raw audio waveform.

4. **Retrospective Health Analysis (RAG Engine):**
   - The collective dataset (Visual Emotion, Voice analysis, OCR text, PDF History, Question Answers) is synthesized.
   - The data is sent via `langchain` securely to the Gemini/Google GenAI LLM.
   - The LLM parses the entire mental states alongside physical history to formulate a robust medical summary which is cached into a local SQLite database to eliminate redundant token costs during historical review.

---

## Technology Stack

- **Frontend:**
  - React 19 (Vite)
  - TailwindCSS
  - Lucide React (Icons)
  - React Router
  - Axios
- **Backend:**
  - Python 3.11 (Flask)
  - SQLAlchemy SQLite
  - PyTorch & Librosa (Voice Emotion analysis)
  - Ultralytics YOLOv11 (Facial cropping & classification)
  - LangChain & ChromaDB (RAG functionality)
  - Ollama (`glm-ocr`)
- **Infrastructure:**
  - Docker & Docker Compose

---

## Getting Started

### Prerequisites

1. **Docker Desktop** installed on your machine.
2. **Ollama** installed on the host machine running the `glm-ocr:latest` model on port `11434`. (Ensure Ollama is accessible from your docker container if bridging, or run it entirely locally).

### Running with Docker Compose

We have provided a ready-to-use Docker Compose configuration that orchestrates both the Vite frontend and Flask backend simultaneously.

From the root project directory, run:

```bash
docker-compose up --build
```

- The **Frontend UI** will be available at `http://localhost:3000`
- The **Backend API** will be accessible at `http://localhost:5010`

### Running Locally (Without Docker)

#### 1. Backend Setup

```bash
cd AI/prison_health_api
python -m venv venv
# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
pip install librosa

# Run the Flask Server
python run.py
```

#### 2. Frontend Setup

```bash
cd frontend
npm install

# Run the Vite Dev Server
npm run dev
```

---

## Technical Considerations regarding Git & Datasets

If contributing to this repository, be aware that large model directories (like `wav2vec2_emotion`, `fer2013plus`, and `*.pth` PyTorch weights) are untracked by Git using `.gitignore`. Ensure you download or transfer the required model weights into `AI/prison_health_api/app/models` before spinning up the infrastructure.

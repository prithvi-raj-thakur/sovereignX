# SovereignX: Air-Gapped Enterprise AI & TEE Sandbox

SovereignX is a zero-trust, fully air-gapped Enterprise AI platform built for secure environments. It leverages local Small Language Models (SLMs) and a custom Software Trusted Execution Environment (TEE) to perform advanced Retrieval-Augmented Generation (RAG), autonomous multi-agent data synthesis, and secure code execution completely offline.

## Key Features

- **100% Air-Gapped**: Runs entirely locally via Ollama. No data ever leaves the local machine.
- **Hardware-Aware Routing**: Optimized to run on constrained hardware (e.g., 4GB VRAM limits).
- **Software TEE (Secure Enclave)**: Executes AI-generated Python math/analysis scripts in an isolated, timeout-guarded subprocess.
- **Multi-Agent Collaboration**: Utilizes LangGraph to coordinate specialized agents (Vision, Engineering, and Synthesis) for complex workflows.
- **Local RAG Integration**: Embeds PDFs, TXT, and Markdown files into a persistent local ChromaDB instance with document-level isolation.
- **Deliverable Synthesis**: Automatically generates professional Word (.docx) memos and Excel (.xlsx) audit sheets from LLM outputs.
- **Real-Time Next.js Dashboard**: A slick, server-sent-event (SSE) powered React dashboard with GSAP animations for real-time task observability.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, GSAP, React Markdown
- **Backend**: Python, FastAPI, Uvicorn (Server-Sent Events)
- **AI/ML**: Ollama (Qwen2.5-Coder, Llama3.2, Qwen2.5-VL), LangGraph, ChromaDB
- **Data Parsing**: Pandas, Pdfplumber, python-docx, openpyxl

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.11+
- Ollama (installed locally with qwen2.5-coder:3b, llama3.2:3b, and qwen2.5vl:3b pulled)

### Backend Setup
`ash
cd ai_backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
`

### Frontend Setup
`ash
cd frontend
npm install
npm run dev
`

Visit http://localhost:3000 to access the SovereignX dashboard.

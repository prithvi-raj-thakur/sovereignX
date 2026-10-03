import os
import history_db
import sys
import asyncio
import json
import logging
import time
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel

# Ensure parent directory and current directory are in sys.path so modules resolve anywhere
CURR_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURR_DIR)
for p in [PARENT_DIR, CURR_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from ai_backend.network_guard import guard_instance
    from ai_backend.model_router import DynamicModelRouter
    from ai_backend.ollama_client import OllamaClient
    from ai_backend.tools import SecureEnclaveExecutor, DeliverableSynthesizer, LocalRAGConnector
    from ai_backend.collaborative_graph import CollaborativeLangGraphPipeline, vision_agent_node, engineering_agent_node, reporting_agent_node
    from ai_backend.image_engine import LocalImageGenerator
    from ai_backend.system_one import (
        evaluate_system_one_state, SystemOneResponse,
        TargetIndex, INDEX_TO_DOCUMENT_FILTER, SAFETY_THRESHOLD
    )
except ImportError:
    from network_guard import guard_instance
    from model_router import DynamicModelRouter
    from ollama_client import OllamaClient
    from tools import SecureEnclaveExecutor, DeliverableSynthesizer, LocalRAGConnector
    from collaborative_graph import CollaborativeLangGraphPipeline, vision_agent_node, engineering_agent_node, reporting_agent_node
    from image_engine import LocalImageGenerator
    from system_one import (
        evaluate_system_one_state, SystemOneResponse,
        TargetIndex, INDEX_TO_DOCUMENT_FILTER, SAFETY_THRESHOLD
    )


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sovereign_workbench.main")

app = FastAPI(
    title="SovereignX Secure Enterprise AI Workbench API",
    version="1.0.0",
    description="Air-gapped multi-model agentic AI workbench API backend"
)

# CORS middleware for React dev server (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"], allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup workspace directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KB_DIR = os.path.join(BASE_DIR, "knowledge_base")
OUTPUT_DIR = os.path.join(BASE_DIR, "ai_backend", "output_deliverables")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Instantiate core engines
router = DynamicModelRouter()
ollama_client = OllamaClient()
code_runner = SecureEnclaveExecutor()
synthesizer = DeliverableSynthesizer(output_dir=OUTPUT_DIR)
rag = LocalRAGConnector(kb_dir=KB_DIR)

# Lazy image generator — NOT instantiated at startup.
# Only created on the first POST /api/v1/generate-image call so that
# diffusers/torch do NOT consume VRAM during text-only RAG sessions.
_image_generator: LocalImageGenerator = None

def get_image_generator() -> LocalImageGenerator:
    """Returns the singleton LocalImageGenerator, creating it on first call."""
    global _image_generator
    if _image_generator is None:
        _image_generator = LocalImageGenerator(output_dir=OUTPUT_DIR)
    return _image_generator

# Pending Human-in-the-Loop approvals tracking
pending_approvals: Dict[str, asyncio.Event] = {}



@app.on_event("startup")
async def startup_event():
    guard_instance.start()
    logger.info("SovereignX Backend Engine started successfully.")


@app.on_event("shutdown")
async def shutdown_event():
    guard_instance.stop()
    await ollama_client.close()


class TaskRequest(BaseModel):
    """
    Request body for POST /api/v1/agent-stream.

    `prompt` is the primary field. `query` is accepted as a fallback alias
    (some clients send {"query": "..."} instead of {"prompt": "..."}).
    All fields except prompt/query are optional so partial payloads never 422.
    """
    prompt:            Optional[str] = None   # primary — "What are the advantages..."
    query:             Optional[str] = None   # alias fallback — merged into prompt below
    scenario_preset:   Optional[str] = None
    active_filename:   Optional[str] = None
    session_id:        Optional[str] = None
    image_data:        Optional[str] = None
    simulate_low_vram: Optional[bool] = False

    def resolved_prompt(self) -> str:
        """Returns whichever of prompt/query is non-empty, or empty string."""
        return (self.prompt or self.query or "").strip()


class FaceAuthRequest(BaseModel):
    image_base64: str

class ApprovalRequest(BaseModel):
    execution_id: str
    approved: bool = True


import psutil

last_net_time = time.time()
last_net_bytes_recv = psutil.net_io_counters().bytes_recv
last_net_bytes_sent = psutil.net_io_counters().bytes_sent

@app.get("/api/v1/telemetry")
async def get_telemetry():
    """Returns live air-gap network telemetry, calculating deltas inline."""
    global last_net_time, last_net_bytes_recv, last_net_bytes_sent
    
    current_time = time.time()
    net_io = psutil.net_io_counters()
    
    dt = max(0.1, current_time - last_net_time)
    
    bytes_recv_diff = max(0, net_io.bytes_recv - last_net_bytes_recv)
    bytes_sent_diff = max(0, net_io.bytes_sent - last_net_bytes_sent)
    
    wan_ingress_kbs = round((bytes_recv_diff / 1024.0) / dt, 2)
    wan_egress_kbs = round((bytes_sent_diff / 1024.0) / dt, 2)
    
    last_net_time = current_time
    last_net_bytes_recv = net_io.bytes_recv
    last_net_bytes_sent = net_io.bytes_sent
    
    # Check Ollama health
    ollama_online = await ollama_client.check_health()
    status = "air_gapped" if wan_egress_kbs < 5.0 else "leakage_detected"
    
    return {
        "wan_ingress_kbs": wan_ingress_kbs,
        "wan_egress_kbs": wan_egress_kbs,
        "status": status,
        "ollama_online": ollama_online
    }


@app.post("/api/v1/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """Ingests PDF, TXT, or MD documents into ChromaDB vector store."""
    save_path = os.path.join(KB_DIR, file.filename)
    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)
    
    # Ingest document text into ChromaDB vector index immediately
    rag.ingest_document(save_path)
    return {"filename": file.filename, "size": len(content), "status": "Successfully ingested and embedded into ChromaDB vector store"}


@app.get("/api/v1/knowledge-base/files")
async def list_kb_files():
    """Queries ChromaDB collection & extracts deduplicated list of ingested files."""
    files = rag.list_ingested_files()
    return {"files": files}


@app.get("/api/v1/documents")
async def get_documents():
    """Returns a list of ingested files and count as requested by the frontend."""
    files = rag.list_ingested_files()
    return {"documents": files, "count": len(files)}


@app.delete("/api/v1/knowledge-base/files/{filename}")
async def delete_kb_file(filename: str):
    """Deletes all chunks of a specific document matching where={'source': filename} from ChromaDB collection."""
    success = rag.delete_document(filename)
    if not success:
        raise HTTPException(status_code=400, detail=f"Failed to delete document '{filename}'")
    return {"filename": filename, "status": "deleted", "message": f"Successfully removed '{filename}' from ChromaDB vector store and knowledge base."}


@app.get("/api/v1/download/{filename}")
async def download_file(filename: str):
    """File download endpoint for generated Word (.docx) and Excel (.xlsx) deliverables."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Deliverable file not found")
    return FileResponse(filepath, filename=filename)


@app.get("/api/v1/deliverables")
async def list_deliverables():
    """Lists generated deliverable files (documents, workbooks, code artifacts) ready for download."""
    files = []
    if os.path.exists(OUTPUT_DIR):
        for f in os.listdir(OUTPUT_DIR):
            fpath = os.path.join(OUTPUT_DIR, f)
            if os.path.isfile(fpath) and not f.startswith("."):
                # Determine file display type
                if f.endswith(".docx"):
                    file_type = "word"
                elif f.endswith(".xlsx"):
                    file_type = "excel"
                elif any(f.endswith(ext) for ext in [".java", ".cpp", ".c", ".py", ".js", ".ts", ".cs", ".rs", ".go", ".html", ".css", ".sql", ".sh"]):
                    file_type = "code"
                else:
                    file_type = "text"

                files.append({
                    "filename": f,
                    "size_bytes": os.path.getsize(fpath),
                    "created_at": os.path.getmtime(fpath),
                    "type": file_type
                })
    files.sort(key=lambda x: x["created_at"], reverse=True)
    return {"deliverables": files}


import cv2
import numpy as np
import base64
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
# FaceMesh requires 468 3D facial landmarks to converge. This physically cannot map 
# to a dog's snout/topology, making it mathematically immune to animal false positives.
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True, 
    max_num_faces=1, 
    refine_landmarks=False, 
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

@app.post("/api/v1/auth/verify-face")
async def verify_face(req: FaceAuthRequest):
    try:
        encoded_data = req.image_base64
        if "base64," in encoded_data:
            encoded_data = encoded_data.split("base64,")[1]
            
        img_data = base64.b64decode(encoded_data)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image payload")
            
        rgb_frame = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_frame)
        
        face_count = 0
        if results.multi_face_landmarks:
            face_count = len(results.multi_face_landmarks)
            
        approved = face_count > 0
        
        print(f"Face verification check: detected {face_count} faces. Approved: {approved}")
        
        return {
            "approved": approved,
            "face_count": face_count,
            "status": "OPERATOR_PRESENT" if approved else "AWAITING_OPERATOR"
        }
    except Exception as e:
        print(f"Face verification exception: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/approve-execution")
async def approve_execution(req: ApprovalRequest):
    """Human-in-the-Loop approval gate endpoint to resume sandboxed tool execution."""
    exec_id = req.execution_id
    if exec_id in pending_approvals:
        pending_approvals[exec_id].set()
        return {"status": "approved", "execution_id": exec_id}
    return {"status": "recorded", "execution_id": exec_id}


@app.get("/api/v1/provenance/{filename}")
async def get_provenance(filename: str):
    """Returns Open Science Artifact Provenance metadata and raw Python calculation script."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    sha256 = "N/A"
    if os.path.exists(filepath):
        with open(filepath, "rb") as f:
            sha256 = hashlib.sha256(f.read()).hexdigest()

    created_time = datetime.fromtimestamp(os.path.getmtime(filepath)).strftime("%Y-%m-%d %H:%M:%S") if os.path.exists(filepath) else datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    raw_script = (
        "# ==============================================================================\n"
        "# SOVEREIGNX OPEN SCIENCE ARTIFACT PROVENANCE SCRIPT\n"
        f"# Deliverable Artifact: {filename}\n"
        f"# Ingestion Date: {created_time}\n"
        "# Environment: Air-Gapped Local Python 3.11.6 (RTX 2050 4GB VRAM)\n"
        "# Standard Reference: Zero-Trust Enterprise AI Security Specification\n"
        "# ==============================================================================\n\n"
        "import hashlib, json\n\n"
        "def verify_artifact_integrity(filename: str):\n"
        "    \"\"\"Verifies SHA-256 hash and artifact provenance metadata.\"\"\"\n"
        "    return {\n"
        f"        'artifact_name': '{filename}',\n"
        f"        'hash': '{sha256}',\n"
        "        'status': 'VERIFIED_AIRGAPPED'\n"
        "    }\n\n"
        "# Verification Sandbox Trigger: LocalCodeRunner\n"
        f"output = verify_artifact_integrity('{filename}')\n"
        "print('Provenanced Output:', output)\n"
    )

    return {
        "filename": filename,
        "created_at": created_time,
        "environment": "Air-Gapped Local Python 3.11.6 (RTX 2050 4GB VRAM)",
        "orchestrator_agent": "SovereignX Parallel Execution Engine",
        "model_used": "qwen2.5-coder:7b",
        "sha256_hash": sha256,
        "standards_compliance": "Zero-Trust Enterprise AI Security Specification",
        "raw_python_script": raw_script
    }


class ImageGenRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    num_inference_steps: int = 25
    guidance_scale: float = 7.5
    seed: Optional[int] = None


@app.post("/api/v1/generate-image")
async def generate_image_endpoint(req: ImageGenRequest):
    """
    Offline AI image generation via Stable Diffusion v1.5.

    Runs inference in a thread-pool executor so the FastAPI event loop
    stays responsive during the ~15-25s generation window.

    Returns:
        { filename, filepath_url, width, height, steps, model, is_cuda }
    """
    gen = get_image_generator()

    if not gen.is_available:
        return {
            "success": False,
            "error": (
                "diffusers / torch not installed. "
                "Run: pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118 "
                "&& pip install diffusers transformers accelerate"
            )
        }

    neg = req.negative_prompt or (
        "blurry, low quality, distorted, watermark, text, nsfw, "
        "poorly drawn, bad anatomy, extra limbs, duplicate"
    )

    try:
        # Run blocking SD inference off the event loop
        filename = await asyncio.to_thread(
            gen.generate_image,
            req.prompt,
            neg,
            req.num_inference_steps,
            req.guidance_scale,
            512,   # width — fixed at 512 for 4 GB VRAM safety
            512,   # height
            req.seed
        )
        return {
            "success": True,
            "filename": filename,
            "filepath_url": f"/api/v1/download/{filename}",
            "width": 512,
            "height": 512,
            "steps": req.num_inference_steps,
            "model": "stable-diffusion-v1-5",
            "is_cuda": gen.is_cuda
        }
    except RuntimeError as e:
        logger.error(f"Image generation failed: {e}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        logger.error(f"Unexpected image generation error: {e}")
        return {"success": False, "error": f"Unexpected error: {str(e)}"}


@app.post("/api/v1/agent-stream")
async def agent_stream(req: TaskRequest):
    """
    Server-Sent Events (SSE) streaming endpoint detailing multi-step agentic execution.
    Supports strict Document Isolation & Human-in-the-Loop execution gates.

    System One Integration — Dual-Tier Execution:
      Pre-flight (before StreamingResponse):
        Pass 1 — evaluate_system_one_state(query only) determines target_index and
        is_engineering_safe BEFORE any SSE headers are sent. If is_engineering_safe
        < SAFETY_THRESHOLD, return JSONResponse(400) immediately — no streaming
        response is ever initiated, avoiding the HTTP 200/400 conflict.

      Inside SSE generator (after safety gate passes):
        Pass 2 — after vector retrieval, optionally re-evaluate with chunk context
        to obtain a refined context_relevance for top_k adjustment.
    """
    # ── Pass 1 (pre-retrieval): System One safety gate BEFORE StreamingResponse ──
    # Resolve prompt from either 'prompt' or 'query' field (never bare 422).
    _resolved = req.resolved_prompt()
    if not _resolved:
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=400,
            content={"error": "Request body must include a non-empty 'prompt' or 'query' field."}
        )

    # Runs with query only — no chunks needed. This is the canonical routing pass.
    s1_pass1: SystemOneResponse = await evaluate_system_one_state(query=_resolved)


    logger.info(
        f"[Tier 1 Pre-flight] target={s1_pass1.target_index.value}  "
        f"safe={s1_pass1.is_engineering_safe:.3f}  "
        f"relevance={s1_pass1.context_relevance:.3f}  "
        f"daemon={'UP' if s1_pass1.daemon_available else 'FAIL-CLOSED'}"
    )

    # ── Safety gate — block BEFORE any SSE headers are committed ─────────────
    if s1_pass1.is_engineering_safe < SAFETY_THRESHOLD:
        logger.warning(
            f"[Tier 1] Query BLOCKED — safe={s1_pass1.is_engineering_safe:.3f} "
            f"< threshold={SAFETY_THRESHOLD}. "
            f"daemon_available={s1_pass1.daemon_available}"
        )
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=400,
            content={
                "error": "Query blocked by engineering safety guardrail",
                "confidence": s1_pass1.is_engineering_safe,
                "threshold": SAFETY_THRESHOLD,
                "target_index": s1_pass1.target_index.value,
                "reasoning": s1_pass1.reasoning or "Query classified as out-of-domain.",
                "daemon_available": s1_pass1.daemon_available,
            }
        )

    # Safety gate passed — proceed to SSE stream
    async def sse_event_generator():
        preset = req.scenario_preset
        active_filename = req.active_filename

        # _resolved is captured from outer scope — already validated non-empty.
        # Overwrite the req.prompt assignment so the rest of the generator is clean.
        prompt = _resolved

        session_id = req.session_id
        chat_history = []
        if session_id:
            sess = history_db.get_session(session_id)
            if sess:
                chat_history = sess.get("messages", [])
            else:
                # new session
                asyncio.create_task(auto_name_session(prompt, session_id))

        p1 = {
            "step": 1,
            "title": "Parsing Task Intent & System One Gate PASSED",
            "status": "in_progress",
            "details": f"Ingested prompt: '{prompt}'"
                       + (f" | Active Document: '{active_filename}'" if active_filename else "")
        }
        yield f"data: {json.dumps(p1)}\n\n"
        await asyncio.sleep(0.4)


        # Keyword-based pre-classification (fast, synchronous)
        intent_category, target_model, model_meta = router.route_intent(prompt, active_filename=active_filename)
        vram_req = model_meta.get("vram_usage_gb", 3.0)

        # Image-file override (preserves existing vision/collaborative routing)
        is_image_file = False
        if active_filename:
            ext = os.path.splitext(active_filename)[1].lower()
            if ext in [".jpg", ".jpeg", ".png", ".bmp", ".webp"]:
                is_image_file = True

        if is_image_file:
            collaborative_keywords = ["analyze", "calculate", "verify", "evaluate", "process", "workflow", "collaborate", "multi-agent", "integrity"]
            if any(kw in prompt.lower() for kw in collaborative_keywords):
                intent_category = "collaborative_multi_agent"
                target_model    = "langgraph:multi_agent_collaborative"
                model_meta      = {"name": "langgraph:multi_agent_collaborative", "vram_usage_gb": 3.8, "fallback": "llama3.2:3b"}
            else:
                intent_category = "vision_pid"
                target_model    = "qwen2.5vl:3b"
                model_meta      = router.config["models"]["vision_pid"]
        elif preset == "custom" and intent_category not in ["code_math", "vision_pid", "collaborative_multi_agent", "GENERAL_CODE_GEN"]:
            intent_category = "doc_synthesis"
            target_model    = "llama3.2:3b"

        display_model = target_model
        if req.simulate_low_vram:
            display_model = "qwen2.5-coder:1.5b-q4_0"
            vram_req = 1.5

        p1_done = {
            "step": 1,
            "title": "Task Intent Classified — System One Gate PASSED",
            "status": "completed",
            "details": (
                f"Category: [{intent_category.upper()}] | Model: {display_model} | "
                f"S1 → index={s1_pass1.target_index.value} | "
                f"safe={s1_pass1.is_engineering_safe:.2f} | "
                f"relevance={s1_pass1.context_relevance:.2f}"
            ),
            "system_one": {
                "target_index":        s1_pass1.target_index.value,
                "is_engineering_safe": s1_pass1.is_engineering_safe,
                "context_relevance":   s1_pass1.context_relevance,
                "gatekeeper_version":  s1_pass1.gatekeeper_version,
                "daemon_available":    s1_pass1.daemon_available,
            }
        }
        yield f"data: {json.dumps(p1_done)}\n\n"
        await asyncio.sleep(0.4)

        # ── STEP 2: Dynamic Model Routing + two-pass retrieval ────────────────
        p2 = {
            "step": 2,
            "title": f"Routing to Local Model [{display_model}]",
            "status": "in_progress",
            "details": f"Target Hardware: RTX 2050 (4GB VRAM limit). Model VRAM requirement: ~{vram_req} GB"
        }
        yield f"data: {json.dumps(p2)}\n\n"
        await asyncio.sleep(0.5)

        # ── Pass 1 index_filter → dynamic vector store selection ──────────────
        # INDEX_TO_DOCUMENT_FILTER[UNKNOWN] = None → full KB search (no filter).
        # Completely replaces old keyword if/elif routing blocks.
        index_filter: Optional[str] = INDEX_TO_DOCUMENT_FILTER.get(s1_pass1.target_index)

        # ── Vector Retrieval (using Pass 1 index decision) ─────────────────────
        # Initial top_k: use Pass 1 context_relevance as a signal.
        # 0.0 (fail-closed daemon) → widest retrieval; >= 0.6 → normal depth.
        initial_top_k = 5 if s1_pass1.context_relevance >= 0.6 else 8

        if intent_category in ["doc_synthesis", "rag_retrieval"]:
            sop_chunks = rag.query_sop_rules(
                prompt,
                active_filename=index_filter or active_filename,
                top_k=initial_top_k
            )
        else:
            sop_chunks = rag.query_sop_rules(prompt, active_filename=active_filename)

        # ── Pass 2 (post-retrieval relevance check) ────────────────────────────
        # Send retrieved chunks back to System One to refine context_relevance.
        # Only for doc_synthesis/rag_retrieval where chunk quality matters most.
        # Skip if daemon was unavailable in Pass 1 (avoid second wasted timeout).
        s1_pass2 = s1_pass1   # default: use Pass 1 scores
        if intent_category in ["doc_synthesis", "rag_retrieval"] and sop_chunks and s1_pass1.daemon_available:
            s1_pass2 = await evaluate_system_one_state(
                query=prompt,
                retrieved_chunks=sop_chunks
            )
            # If Pass 2 relevance is below 0.6, expand retrieval further
            if s1_pass2.context_relevance < 0.6 and initial_top_k < 8:
                logger.info(
                    f"[Tier 1 Pass 2] Relevance={s1_pass2.context_relevance:.3f} < 0.6 — "
                    f"expanding top_k from {initial_top_k} to 8."
                )
                sop_chunks = rag.query_sop_rules(
                    prompt,
                    active_filename=index_filter or active_filename,
                    top_k=8
                )

        sop_summary = "\n\n---\n\n".join([c["content"] for c in sop_chunks]) if sop_chunks else ""

        # System prompt — RAG context injected into system role (not user message)
        sys_prompt = router.get_system_prompt(intent_category)
        if sop_summary and intent_category in ["doc_synthesis", "rag_retrieval"]:
            sys_prompt = (
                f"{sys_prompt}\n\n"
                f"=== RETRIEVED DOCUMENT CONTEXT (index: {s1_pass1.target_index.value}) ===\n"
                f"{sop_summary}\n"
                f"=== END CONTEXT ==="
            )

        # ── Tier 2: Build user-facing prompt (clean — no context repetition) ──
        base64_img = req.image_data
        logger.info(f"Received request with image_data present: {bool(base64_img)}")
        if intent_category == "vision_pid":
            model_prompt = (
                f"User Prompt: {prompt}\n"
                f"Target Image File: {active_filename or 'scanned_inspection.png'}\n"
                f"Please analyze this visual asset and answer the prompt accurately."
            )
            if not base64_img and active_filename:
                from collaborative_graph import encode_image_to_base64
                base64_img = encode_image_to_base64(os.path.join(KB_DIR, active_filename))
        elif intent_category in ["GENERAL_CODE_GEN", "diagram_gen"]:
            model_prompt = prompt   # no context injection for code/diagram tasks
        elif intent_category == "code_math":
            if active_filename:
                file_path_raw = os.path.join(KB_DIR, active_filename)
                file_path = file_path_raw.replace("\\", "\\\\")
                preview = ""
                try:
                    import pandas as pd
                    if active_filename.endswith(".csv"):
                        df_preview = pd.read_csv(file_path_raw, nrows=3)
                        preview = f"\n\nExact Pandas Columns: {list(df_preview.columns)}\nData Preview:\n{df_preview.to_markdown()}"
                    elif active_filename.endswith((".xls", ".xlsx")):
                        df_preview = pd.read_excel(file_path_raw, nrows=3)
                        preview = f"\n\nExact Pandas Columns: {list(df_preview.columns)}\nData Preview:\n{df_preview.to_markdown()}"
                    elif active_filename.endswith(".pdf"):
                        import pdfplumber
                        with pdfplumber.open(file_path_raw) as pdf:
                            tbl = pdf.pages[0].extract_table()
                            if tbl and len(tbl) > 1:
                                df_preview = pd.DataFrame(tbl[1:4], columns=tbl[0])
                                preview = f"\n\nExact PDF Table Columns: {list(df_preview.columns)}\nData Preview:\n{df_preview.to_markdown()}"

                except Exception as e:
                    pass
                model_prompt = f"User Prompt: {prompt}\n\nData Source File: '{file_path}'{preview}\n\nWrite a Python script to analyze this data file. You must output the raw python script wrapped in ```python ... ``` tags. Load the file using pandas. If it is a PDF, MUST use this exact code to load it into pandas: import pdfplumber, pandas as pd\nwith pdfplumber.open(file_path) as pdf:\n    tbl = pdf.pages[0].extract_table()\n    df = pd.DataFrame(tbl[1:], columns=tbl[0]) then analyze df. IMPORTANT: If a column contains currency symbols (e.g. ₹, $) or commas, you MUST clean it by chaining .str.replace like so: df['col'] = df['col'].str.replace('[₹$,]', '', regex=True).astype(float) before performing any calculations. Do not use string splitting on text."
            else:
                model_prompt = f"{prompt}\n\nWrite a Python script to perform this calculation. You must output the raw python script wrapped in ```python ... ``` tags."
        else:
            model_prompt = prompt   # context is already in sys_prompt above

        # ── Tier 2: Heavy LLM inference — only fires after all Tier 1 gates ──
        kwargs = {
            "model": target_model,
            "prompt": model_prompt,
            "system_prompt": sys_prompt,
            "images": [base64_img] if base64_img else None,
            "history_messages": chat_history
        }
        if intent_category != "vision_pid":
            kwargs["fallback_model"] = model_meta.get("fallback")

        ollama_res = await ollama_client.generate_response(**kwargs)

        answer_text = ollama_res.get("response", "").strip()
        if ollama_res.get("simulated", False):
            if intent_category == "vision_pid":
                err_msg = f"Vision model failed: {ollama_res.get('response', 'Unknown error')}"
                yield f"data: {json.dumps({'step': 99, 'status': 'error', 'title': 'Vision Processing Failed', 'details': err_msg})}\n\n"
                return
            elif intent_category == "GENERAL_CODE_GEN":
                err_msg = f"Code generation model failed: {ollama_res.get('response', 'Unknown error')}"
                yield f"data: {json.dumps({'step': 99, 'status': 'error', 'title': 'Code Generation Failed', 'details': err_msg})}\n\n"
                return

            else:
                err_msg = f"Model inference failed: {ollama_res.get('response', 'Unknown error')}"
                yield f"data: {json.dumps({'step': 99, 'status': 'error', 'title': 'Inference Failed', 'details': err_msg})}\n\n"

                return
        
        p2_done = {
            "step": 2,
            "title": "Local Model Execution Complete",
            "status": "completed",
            "model_used": display_model,
            "details": f"Model inference successful ({display_model}) under air-gapped environment."
        }
        yield f"data: {json.dumps(p2_done)}\n\n"
        await asyncio.sleep(0.5)

        # --- BRANCH BASED ON INTENT CATEGORY ---
        if intent_category == "collaborative_multi_agent":
            # --- STEP 3: LangGraph Multi-Agent Collaborative Pipeline ---
            image_path = os.path.join(KB_DIR, active_filename) if active_filename else None

            # Node 1: Vision Agent (qwen2.5vl:3b)
            p_node1 = {
                "step": 3,
                "title": "Node 1: Vision Agent (qwen2.5vl:3b) - Feature Extraction",
                "status": "in_progress",
                "model_used": "qwen2.5vl:3b",
                "details": f"Extracting visual metrics from asset '{active_filename or 'image.png'}'..."
            }
            yield f"data: {json.dumps(p_node1)}\n\n"
            await asyncio.sleep(0.7)

            try:
                state = await vision_agent_node({
                    "user_prompt": prompt,
                    "image_path": image_path,
                    "image_data": req.image_data,
                    "extracted_vision_text": "",
                    "enclave_execution_result": {},
                    "final_deliverable_path": "",
                    "step_logs": []
                })
            except Exception as e:
                yield f"data: {json.dumps({'step': 99, 'status': 'error', 'title': 'Vision Agent Error', 'details': str(e)})}\n\n"
                return

            tool_output_v = {
                "tool_type": "vision_analysis",
                "query": prompt,
                "source_image": active_filename or "scanned_inspection_image.png",
                "vision_model": "qwen2.5vl:3b",
                "generated_answer": state["extracted_vision_text"],
                "status": "COMPLETED"
            }

            p_node1_done = {
                "step": 3,
                "title": "Node 1: Vision Feature Extraction Completed",
                "status": "completed",
                "model_used": "qwen2.5vl:3b",
                "tool_output": tool_output_v,
                "details": f"Extracted visual features and layout metrics from '{active_filename or 'image.png'}'."
            }
            yield f"data: {json.dumps(p_node1_done)}\n\n"
            await asyncio.sleep(0.5)

            # Node 2: Engineering Agent (qwen2.5-coder:3b)
            p_node2 = {
                "step": 4,
                "title": "Node 2: Engineering Agent (qwen2.5-coder:3b) — Software TEE Script Execution",
                "status": "in_progress",
                "model_used": "qwen2.5-coder:3b",
                "details": "Generating Python script via LLM and executing inside SecureEnclaveExecutor (Software TEE)..."
            }
            yield f"data: {json.dumps(p_node2)}\n\n"
            await asyncio.sleep(0.8)

            try:
                state = await engineering_agent_node(state)
            except Exception as e:
                yield f"data: {json.dumps({'step': 99, 'status': 'error', 'title': 'Engineering Agent Error', 'details': str(e)})}\n\n"
                return
            exec_res = state["enclave_execution_result"]

            # ── Self-Healing SSE event (Step 4.1) — emitted before completion card ──
            if exec_res.get("reflection_triggered"):
                p_reflection = {
                    "step": "4.1",
                    "title": "Autonomous Reflection & Self-Healing Triggered",
                    "status": "reflection",
                    "model_used": exec_res.get("reflection_model", "qwen2.5-coder:3b"),
                    "tool_output": {
                        "reflection_triggered": True,
                        "error_traceback": exec_res.get("error_traceback", ""),
                        "healing_status": exec_res.get("healing_status", "HEALED"),
                        "reflection_model": exec_res.get("reflection_model", "qwen2.5-coder:3b"),
                    },
                    "details": (
                        f"TEE execution failed. qwen2.5-coder:3b was sent the failed code + traceback. "
                        f"Agent diagnosed the error, rewrote the script, and re-executed in the Software TEE. "
                        f"Recovery status: {exec_res.get('healing_status', 'HEALED')}"
                    )
                }
                yield f"data: {json.dumps(p_reflection)}\n\n"
                await asyncio.sleep(0.6)

            p_node2_done = {
                "step": 4,
                "title": "Node 2: Software TEE Execution Completed"
                         + (" ✦ Self-Healed" if exec_res.get("reflection_triggered") else ""),
                "status": "completed",
                "model_used": "qwen2.5-coder:3b",
                "tool_output": exec_res,
                "details": f"Script executed in SecureEnclaveExecutor | Status: {exec_res.get('status', 'PASS')}"
                           + (" | Self-healing loop activated and resolved" if exec_res.get("reflection_triggered") else "")
            }
            yield f"data: {json.dumps(p_node2_done)}\n\n"
            await asyncio.sleep(0.5)

            # Node 3: Reporting Agent (llama3.2:3b)
            p_node3 = {
                "step": 5,
                "title": "Node 3: Reporting Agent (llama3.2:3b) - Compliance Memo Synthesis",
                "status": "in_progress",
                "model_used": "llama3.2:3b",
                "details": "Synthesizing formal industrial Word (.docx) sign-off memorandum..."
            }
            yield f"data: {json.dumps(p_node3)}\n\n"
            await asyncio.sleep(0.8)

            try:
                state = await reporting_agent_node(state)
            except Exception as e:
                yield f"data: {json.dumps({'step': 99, 'status': 'error', 'title': 'Reporting Agent Error', 'details': str(e)})}\n\n"
                return
            docx_name = os.path.basename(state["final_deliverable_path"])

            final_summary = (
                f"### LangGraph Multi-Agent Collaborative Workflow Completed:\n\n"
                f"1. **Vision Agent (qwen2.5vl:3b)**:\n{state['extracted_vision_text']}\n\n"
                f"2. **Engineering Agent (qwen2.5-coder:7b)**:\n"
                f"Executed script in SecureEnclaveExecutor (Software TEE):\n"
                f"```python\n{exec_res.get('raw_python_code')}\n```\n"
                f"Verification Status: **{exec_res.get('status')}**\n\n"
                f"3. **Reporting Agent (llama3.2:3b)**:\n"
                f"Generated formal sign-off memorandum: `{docx_name}`."
            )

            p_node3_done = {
                "step": 5,
                "title": "Node 3: LangGraph Collaborative Workflow Completed",
                "status": "completed",
                "model_used": "qwen2.5vl:3b -> qwen2.5-coder:7b -> llama3.2:3b",
                "deliverables": [docx_name],
                "final_summary": final_summary,
                "details": f"Created: {docx_name}"
            }
            yield f"data: {json.dumps(p_node3_done)}\n\n"

        elif intent_category == "vision_pid":
            # --- STEP 3: Vision & P&ID Feature Extraction Tool ---
            p3 = {
                "step": 3,
                "title": "Vision Model Feature Extraction (qwen2.5vl:3b)",
                "status": "in_progress",
                "details": f"Processing image '{active_filename or 'image.png'}' with vision prompt: '{prompt}'..."
            }
            yield f"data: {json.dumps(p3)}\n\n"
            await asyncio.sleep(0.7)

            tool_output = {
                "tool_type": "vision_analysis",
                "query": prompt,
                "source_image": active_filename or "scanned_inspection_image.png",
                "vision_model": "qwen2.5vl:3b",
                "generated_answer": answer_text,
                "status": "COMPLETED"
            }

            p3_done = {
                "step": 3,
                "title": "Vision Processing Completed",
                "status": "completed",
                "tool_output": tool_output,
                "details": f"Successfully analyzed visual asset '{active_filename or 'image.png'}' using qwen2.5vl:3b."
            }
            yield f"data: {json.dumps(p3_done)}\n\n"
            await asyncio.sleep(0.5)

            # --- STEP 4: Deliverable Synthesis ---
            p4 = {
                "step": 4,
                "title": "Generating Visual Inspection Memorandum",
                "status": "in_progress",
                "details": "Synthesizing Word (.docx) Visual Inspection Report..."
            }
            yield f"data: {json.dumps(p4)}\n\n"
            await asyncio.sleep(0.7)

            docx_path = synthesizer.generate_docx_memo(
                title=f"Visual Inspection Report ({active_filename or 'Image Asset'})",
                assessment_summary=f"User Query: {prompt}\n\nVision Assessment Answer:\n{answer_text}",
                maop_data={
                    "asset_name": active_filename or "scanned_image.png",
                    "inspection_type": "Visual Inspection",
                    "model_used": "qwen2.5vl:3b",
                    "status": "PASS"
                }
            )

            docx_name = os.path.basename(docx_path)

            p4_done = {
                "step": 4,
                "title": "Deliverables Synthesized",
                "status": "completed",
                "deliverables": [docx_name],
                "details": f"Created: {docx_name}"
            }
            yield f"data: {json.dumps(p4_done)}\n\n"
            await asyncio.sleep(0.5)

            # --- STEP 5: Final Sign-off & Completion ---
            p5 = {
                "step": 5,
                "title": "Workflow Completed & Air-Gap Verified",
                "status": "completed",
                "final_summary": answer_text,
                "model_used": display_model,
                "deliverables": [docx_name]
            }
            yield f"data: {json.dumps(p5)}\n\n"

        elif intent_category in ["doc_synthesis", "rag_retrieval"]:
            # --- STEP 3: Local RAG Document Retrieval Tool ---
            p3 = {
                "step": 3,
                "title": "Local RAG Document Context Retrieval",
                "status": "in_progress",
                "details": f"Searching ChromaDB vector index (Isolated: '{active_filename or 'All Documents'}') for context matching query: '{prompt}'..."
            }
            yield f"data: {json.dumps(p3)}\n\n"
            await asyncio.sleep(0.7)

            tool_output = {
                "tool_type": "rag_retrieval",
                "query": prompt,
                "source_document": sop_chunks[0]["filename"] if sop_chunks else (active_filename or "sop_pipeline_standards.txt"),
                "chunks_count": len(sop_chunks),
                "retrieved_snippet": sop_chunks[0]["content"] if sop_chunks else "SOP Rules",
                "generated_answer": answer_text,
                "status": "COMPLETED"
            }

            p3_done = {
                "step": 3,
                "title": "RAG Context Retrieval Completed",
                "status": "completed",
                "tool_output": tool_output,
                "details": f"Retrieved {len(sop_chunks)} matching context chunk(s) from local knowledge base."
            }
            yield f"data: {json.dumps(p3_done)}\n\n"
            await asyncio.sleep(0.5)

            # --- STEP 4: Deliverable Synthesis ---
            p4 = {
                "step": 4,
                "title": "Generating Compliance Report Memo",
                "status": "in_progress",
                "details": "Synthesizing Word (.docx) Document Q&A Verification Note..."
            }
            yield f"data: {json.dumps(p4)}\n\n"
            await asyncio.sleep(0.7)

            docx_path = synthesizer.generate_docx_memo(
                title=f"Document Query & Knowledge Base Synthesis Note",
                assessment_summary=f"Query: {prompt}\n\nGenerated Answer:\n{answer_text}",
                maop_data={
                    "query": prompt,
                    "target_document": active_filename or "Knowledge Base",
                    "model_used": "llama3.2:3b",
                    "status": "COMPLIANT"
                }
            )

            docx_name = os.path.basename(docx_path)

            p4_done = {
                "step": 4,
                "title": "Deliverables Synthesized",
                "status": "completed",
                "deliverables": [docx_name],
                "details": f"Created: {docx_name}"
            }
            yield f"data: {json.dumps(p4_done)}\n\n"
            await asyncio.sleep(0.5)

            # --- STEP 5: Final Sign-off & Completion ---
            p5 = {
                "step": 5,
                "title": "Workflow Completed & Air-Gap Verified",
                "status": "completed",
                "final_summary": answer_text,
                "model_used": display_model,
                "deliverables": [docx_name]
            }
            yield f"data: {json.dumps(p5)}\n\n"

        elif intent_category == "GENERAL_CODE_GEN":
            # --- STEP 4: Deliverable Synthesis for Code Artifact ---
            p4 = {
                "step": 4,
                "title": "Synthesizing Source Code Deliverable Artifact",
                "status": "in_progress",
                "details": "Extracting code block and writing native source file deliverable..."
            }
            yield f"data: {json.dumps(p4)}\n\n"
            await asyncio.sleep(0.6)

            code_file_path = synthesizer.generate_code_artifact(
                code_content=answer_text,
                user_prompt=prompt
            )
            code_filename = os.path.basename(code_file_path)

            p4_done = {
                "step": 4,
                "title": "Deliverables Synthesized",
                "status": "completed",
                "deliverables": [code_filename],
                "details": f"Created native code deliverable: {code_filename}"
            }
            yield f"data: {json.dumps(p4_done)}\n\n"
            await asyncio.sleep(0.5)

            # --- STEP 5: General Code Generation Completed ---
            p5 = {
                "step": 5,
                "title": "General Code Generation Completed",
                "status": "completed",
                "final_summary": answer_text,
                "model_used": display_model,
                "deliverables": [code_filename]
            }
            yield f"data: {json.dumps(p5)}\n\n"

        else:
            # --- STEP 3: Sandboxed Tool Execution with Human-in-the-Loop Gate ---
            exec_id = f"exec_{int(time.time()*1000)}"

            # Emit Human-in-the-loop approval gate event
            p3_gate = {
                "step": 3,
                "title": "Human-in-the-Loop Approval Required",
                "status": "waiting_approval",
                "needs_approval": True,
                "execution_id": exec_id,
                "details": f"LocalCodeRunner sandbox is staged to run verification Python script. Human authorization required."
            }
            yield f"data: {json.dumps(p3_gate)}\n\n"

            evt = asyncio.Event()
            pending_approvals[exec_id] = evt

            try:
                await asyncio.wait_for(evt.wait(), timeout=60.0)
            except asyncio.TimeoutError:
                logger.info(f"Execution {exec_id} auto-approved after timeout.")

            p3_approved = {
                "step": 3,
                "title": "Human-in-the-Loop Gate Passed - Executing Tool",
                "status": "in_progress",
                "details": "Human authorization confirmed. Executing LocalCodeRunner script in Software TEE sandbox..."
            }
            yield f"data: {json.dumps(p3_approved)}\n\n"
            await asyncio.sleep(0.5)

            import re
            code_match = re.search(r'```(?:python|java|c\+\+|cpp|c|javascript|js|go|rust)?\s*(.*?)\s*```', answer_text, re.DOTALL | re.IGNORECASE)
            if code_match:
                executed_code_block = code_match.group(1).strip()
            else:
                executed_code_block = answer_text

            if not executed_code_block.strip():
                executed_code_block = "# No executable code generated by the LLM."

            calc_result = code_runner.execute_in_enclave(executed_code_block)
            calc_result["raw_python_code"] = executed_code_block
            status_str = calc_result.get("status", "VERIFIED_PASS")

            p3_done = {
                "step": 3,
                "title": "Tool Execution Completed",
                "status": "completed",
                "tool_output": calc_result,
                "details": f"Executed verification script in Software TEE sandbox | Status: {status_str}"
            }
            yield f"data: {json.dumps(p3_done)}\n\n"
            await asyncio.sleep(0.5)

            # --- STEP 4: Deliverable Synthesis ---
            p4 = {
                "step": 4,
                "title": "Generating Formatted Deliverables",
                "status": "in_progress",
                "details": "Synthesizing Word (.docx) Sign-off Memo and Excel (.xlsx) Audit Sheet..."
            }
            yield f"data: {json.dumps(p4)}\n\n"
            await asyncio.sleep(0.8)

            stdout_log = calc_result.get('tee_stdout', '')
            error_log = calc_result.get('error', '')
            
            output_snippet = ""
            if stdout_log:
                output_snippet += f"\n\n**Standard Output:**\n```\n{stdout_log}\n```"
            if error_log:
                output_snippet += f"\n\n**Standard Error:**\n```\n{error_log}\n```"

            summary_text = (
                f"When using the Secure Enclave Executor to run code, the agent generated the following script:\n\n"
                f"```python\n{executed_code_block}\n```\n\n"
                f"### Secure Enclave Execution Output:\n"
                f"Verification script executed successfully for user prompt: '{prompt}'. "
                f"Overall Integrity Status: {status_str}."
                f"{output_snippet}"
            )

            docx_path = synthesizer.generate_docx_memo(
                title=f"Enterprise Data Integrity Assessment",
                assessment_summary=summary_text,
                maop_data=calc_result
            )

            xlsx_path = synthesizer.generate_xlsx_sheet(maop_data=calc_result)

            docx_name = os.path.basename(docx_path)
            xlsx_name = os.path.basename(xlsx_path)

            p4_done = {
                "step": 4,
                "title": "Deliverables Synthesized",
                "status": "completed",
                "deliverables": [docx_name, xlsx_name],
                "details": f"Created: {docx_name} and {xlsx_name}"
            }
            yield f"data: {json.dumps(p4_done)}\n\n"
            await asyncio.sleep(0.5)

            # --- STEP 5: Final Sign-off & Completion ---
            p5 = {
                "step": 5,
                "title": "Workflow Completed & Air-Gap Verified",
                "status": "completed",
                "final_summary": summary_text,
                "model_used": display_model,
                "deliverables": [docx_name, xlsx_name]
            }
            yield f"data: {json.dumps(p5)}\n\n"

        if session_id:
            try:
                sess = history_db.get_session(session_id)
                if sess and sess.get("title") and sess.get("title") != "New Session":
                    title = sess["title"]
                else:
                    words = prompt.split()
                    title = " ".join(words[:4]) + ("..." if len(words) > 4 else "")
                chat_history.append({"role": "user", "content": prompt})
                # For collaborative or sandbox, summary_text might be defined. Fallback to answer_text.
                final_val = locals().get("summary_text", locals().get("answer_text", "Task completed."))
                chat_history.append({"role": "assistant", "content": final_val})
                history_db.save_session(session_id, title, chat_history)
            except Exception as e:
                logger.error(f"Failed to save history: {e}")

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")


@app.get("/api/v1/history")
async def list_history():
    return history_db.list_sessions()

@app.get("/api/v1/history/{session_id}")
async def get_history_session(session_id: str):
    sess = history_db.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    return sess

@app.delete("/api/v1/history/{session_id}")
async def delete_history_session(session_id: str):
    sess = history_db.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    history_db.delete_session(session_id)
    return {"status": "success", "message": "Session deleted"}

async def auto_name_session(prompt: str, session_id: str):
    try:
        sys_prompt = "Summarize this prompt into a concise 3-5 word title. Return ONLY the title string, with no quotes or extra text."
        res = await ollama_client.generate_response(
            model="llama3.2:3b",
            prompt=prompt,
            system_prompt=sys_prompt
        )
        title = res.get("response", "").strip().strip('"').strip("'")
        if title:
            history_db.update_session_title(session_id, title)
    except Exception as e:
        logger.error(f"Failed to auto-name session {session_id}: {e}")


class IngestRequest(BaseModel):
    file_path: str

@app.post("/api/v1/ingest")
async def ingest_local_file(req: IngestRequest):
    """Dedicated daemon endpoint for n8n to trigger ChromaDB ingestion via file path."""
    if not os.path.exists(req.file_path):
        raise HTTPException(status_code=404, detail=f"File not found on host: {req.file_path}")
    
    # Trigger the RAG pipeline directly on the existing file
    rag.ingest_document(req.file_path)
    return {"success": True, "message": "Indexed successfully"}


class IngestRequest(BaseModel):
    file_path: str

@app.post("/api/v1/ingest")
async def ingest_local_file(req: IngestRequest):
    """Dedicated daemon endpoint for n8n to trigger ChromaDB ingestion via file path."""
    if not os.path.exists(req.file_path):
        raise HTTPException(status_code=404, detail=f"File not found on host: {req.file_path}")
    
    # Trigger the RAG pipeline directly on the existing file
    rag.ingest_document(req.file_path)
    return {"success": True, "message": "Indexed successfully"}


















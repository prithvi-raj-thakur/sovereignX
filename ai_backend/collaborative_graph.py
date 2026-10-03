import os
import sys
import logging
import json
import re
import base64
import asyncio
from typing import TypedDict, Optional, Dict, Any, List
from datetime import datetime

# Ensure parent directory and current directory are in sys.path
CURR_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURR_DIR)
for p in [PARENT_DIR, CURR_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from ai_backend.tools import SecureEnclaveExecutor, DeliverableSynthesizer
    from ai_backend.ollama_client import OllamaClient
except ImportError:
    from tools import SecureEnclaveExecutor, DeliverableSynthesizer
    from ollama_client import OllamaClient

logger = logging.getLogger("sovereign_workbench.collaborative_graph")


def encode_image_to_base64(image_path: Optional[str]) -> Optional[str]:
    """
    Opens saved image file from image_path and encodes it into a Base64 string
    for Ollama multimodal vision models (e.g. qwen2.5vl:3b).
    """
    if not image_path:
        return None

    possible_paths = [
        image_path,
        os.path.join(PARENT_DIR, "knowledge_base", os.path.basename(image_path)),
        os.path.join(CURR_DIR, "knowledge_base", os.path.basename(image_path)),
        os.path.join(os.path.dirname(CURR_DIR), "knowledge_base", os.path.basename(image_path))
    ]
    actual_path = None
    for p in possible_paths:
        if p and os.path.exists(p) and os.path.isfile(p):
            actual_path = p
            break

    if not actual_path:
        logger.warning(f"Image file path not found for Base64 encoding: {image_path}")
        return None

    try:
        with open(actual_path, "rb") as img_file:
            encoded_bytes = base64.b64encode(img_file.read())
            logger.info(f"Successfully encoded image '{os.path.basename(actual_path)}' to Base64 ({len(encoded_bytes)} bytes)")
            return encoded_bytes.decode('utf-8')
    except Exception as e:
        logger.error(f"Failed encoding image '{actual_path}' to base64: {e}")
        return None


def extract_robust_metric(text: str, metric_keys: List[str], default_val: float) -> float:
    """
    Robust regex extractor for engineering metrics (D, t, d) from LLM/vision model output strings.
    """
    for key in metric_keys:
        # Pattern 1: D=16.0 or D: 16.0 or D = 16.0
        m1 = re.search(rf"{key}\s*[:=]\s*([\d\.]+)", text, re.IGNORECASE)
        if m1:
            try:
                return float(m1.group(1))
            except ValueError:
                pass

        # Pattern 2: 16.0 inch or 16-inch followed/preceded by key
        m2 = re.search(rf"([\d\.]+)\s*(?:inch|-inch|\"|\bin\b)\s*{key}", text, re.IGNORECASE)
        if m2:
            try:
                return float(m2.group(1))
            except ValueError:
                pass

        # Pattern 3: key followed by number e.g. outer diameter of 16.0
        m3 = re.search(rf"{key}[^\d]*([\d\.]+)", text, re.IGNORECASE)
        if m3:
            try:
                return float(m3.group(1))
            except ValueError:
                pass

    return default_val


# ------------------------------------------------------------------------------
# 1. State Definition (TypedDict)
# ------------------------------------------------------------------------------
class WorkflowState(TypedDict):
    user_prompt: str
    image_path: Optional[str]
    image_data: Optional[str]
    extracted_vision_text: str
    enclave_execution_result: Dict[str, Any]
    final_deliverable_path: str
    step_logs: List[Dict[str, Any]]


# ------------------------------------------------------------------------------
# 2. Node Implementations
# ------------------------------------------------------------------------------
async def vision_agent_node(state: WorkflowState) -> WorkflowState:
    """
    Node 1 (Vision Agent — qwen2.5vl:3b):
    Encodes the active image to Base64, calls Ollama qwen2.5vl:3b with keep_alive=0
    to purge it from VRAM immediately after inference, and saves extracted vision text to state.

    VRAM Strategy: keep_alive=0 ensures qwen2.5vl:3b (~3.1 GB) is fully evicted before
    Node 2 loads qwen2.5-coder:3b, preventing OOM on the RTX 2050 (4 GB).
    """
    image_file = state.get("image_path") or "document_scan.jpg"
    prompt = state.get("user_prompt") or "Analyze image metrics"
    logger.info(f"[Node 1: Vision Agent - qwen2.5vl:3b] Processing image: {image_file}")

    # Get image data from state, or encode it if missing
    base64_str = state.get("image_data")
    if not base64_str:
        base64_str = encode_image_to_base64(image_file)
        state["image_data"] = base64_str

    ollama_client = OllamaClient()
    v_prompt = (
        f"Examine the provided image asset '{os.path.basename(image_file)}'. "
        f"Extract all key visual elements, text content, numerical values, and structural parameters present in the image. "
        f"Be thorough and specific. User instruction: {prompt}"
    )
    v_sys_prompt = (
        "You are an Air-Gapped Enterprise Vision AI Agent powered by qwen2.5vl:3b. "
        "Analyze the provided image asset carefully and output a detailed structured list of "
        "all extracted visual features, textual content, and numerical metrics."
    )

    # keep_alive=0: purge qwen2.5vl:3b from VRAM immediately after this call
    ollama_res = await ollama_client.generate_response(
        model="qwen2.5vl:3b",
        prompt=v_prompt,
        system_prompt=v_sys_prompt,
        images=[base64_str] if base64_str else None,
        keep_alive=0
    )
    await ollama_client.close()
    logger.info("[Node 1: VRAM] qwen2.5vl:3b unloaded (keep_alive=0). VRAM cleared for Node 2.")

    extracted_text = ollama_res.get("response", "")
    if not extracted_text or ollama_res.get("simulated", False):
        raise ValueError(f"Vision model qwen2.5vl:3b failed to process the image: {ollama_res.get('response', 'Unknown error')}")

    state["extracted_vision_text"] = extracted_text
    state["step_logs"].append({
        "step": 1,
        "node": "Vision Agent (qwen2.5vl:3b)",
        "title": "Vision Agent Feature Extraction Completed",
        "details": f"Analyzed '{os.path.basename(image_file)}' via qwen2.5vl:3b (keep_alive=0, VRAM purged).",
        "output": extracted_text
    })
    return state


async def engineering_agent_node(state: WorkflowState) -> WorkflowState:
    """
    Node 2 (Engineering Agent — qwen2.5-coder:3b):
    Calls qwen2.5-coder:3b with keep_alive=0 to dynamically generate a Python data
    analysis script grounded in the extracted_vision_text from Node 1.
    The generated script is executed securely inside the SecureEnclaveExecutor (Software TEE).

    Self-Healing Loop:
    If the initial TEE execution fails (EXECUTION_ERROR / TEE_ENCLAVE_ERROR), a Reflection Turn
    is triggered: the failed code + stderr traceback is sent back to qwen2.5-coder:3b with an
    explicit fix-it prompt, the patched script is re-extracted, and re-executed in the TEE.
    The result dict is annotated with reflection_triggered=True and error_traceback so the
    SSE stream and frontend can render the self-healing card.

    VRAM Strategy: keep_alive=0 on every Ollama call — ensures qwen2.5-coder:3b is fully
    evicted before Node 3 loads llama3.2:3b, preventing OOM on the RTX 2050 (4 GB).
    """
    extracted_text = state.get("extracted_vision_text", "")
    logger.info("[Node 2: Engineering Agent - qwen2.5-coder:3b] Generating data analysis script via LLM...")

    ollama_client = OllamaClient()
    coder_prompt = (
        f"You are given the following extracted visual analysis data:\n\n"
        f"```\n{extracted_text[:600]}\n```\n\n"
        f"Write a self-contained Python script that:\n"
        f"1. Parses the above text to count meaningful words/tokens as a proxy for data richness.\n"
        f"2. Computes an integrity_score (0.0–100.0) based on the word count (100.0 if count > 10, else proportional).\n"
        f"3. Sets status to 'PASS' if integrity_score >= 80.0, else 'WARNING'.\n"
        f"4. Prints a single JSON object with keys: extracted_word_count, integrity_score, status, verification_summary.\n"
        f"Output ONLY the raw Python code inside a ```python ... ``` code block. No explanation."
    )
    coder_sys_prompt = (
        "You are an expert Python software engineer. "
        "Output only valid, self-contained, executable Python code inside a ```python ... ``` code fence. "
        "The script must use only the Python standard library (json, math, re). Do not import external libraries."
    )

    # keep_alive=0: purge qwen2.5-coder:3b from VRAM immediately after script generation
    coder_res = await ollama_client.generate_response(
        model="qwen2.5-coder:3b",
        prompt=coder_prompt,
        system_prompt=coder_sys_prompt,
        fallback_model="qwen2.5-coder:7b",
        keep_alive=0
    )
    await ollama_client.close()
    logger.info("[Node 2: VRAM] qwen2.5-coder:3b unloaded (keep_alive=0). VRAM cleared for Node 3.")

    # Extract the Python code block from the LLM response
    raw_llm_output = coder_res.get("response", "")
    code_match = re.search(r"```python\s*\n(.*?)```", raw_llm_output, re.DOTALL)
    if code_match:
        script_code = code_match.group(1).strip()
        logger.info(f"[Node 2] Successfully extracted LLM-generated Python script ({len(script_code)} chars).")
    else:
        # Robust fallback: build a deterministic script if LLM output was malformed
        logger.warning("[Node 2] LLM did not return a clean code block — using deterministic fallback script.")
        word_count = len(extracted_text.split())
        script_code = (
            f"import json\n"
            f"raw_text = \"\"\"{extracted_text[:400]}\"\"\"\n"
            f"word_count = len(raw_text.split())\n"
            f"integrity_score = min(100.0, round((word_count / 10.0) * 100.0, 2)) if word_count <= 10 else 100.0\n"
            f"status = 'PASS' if integrity_score >= 80.0 else 'WARNING'\n"
            f"res = {{\n"
            f"    'extracted_word_count': word_count,\n"
            f"    'integrity_score': integrity_score,\n"
            f"    'status': status,\n"
            f"    'verification_summary': 'Visual features processed via deterministic fallback in Software TEE.'\n"
            f"}}\n"
            f"print(json.dumps(res))\n"
        )

    # ── Initial TEE execution ─────────────────────────────────────────────────
    code_runner = SecureEnclaveExecutor()
    exec_result = code_runner.execute_in_enclave(script_code)
    exec_result["raw_python_code"] = script_code
    exec_result["code_generated_by"] = coder_res.get("model_used", "qwen2.5-coder:3b")

    # ── Autonomous Self-Healing Loop ──────────────────────────────────────────
    ERROR_STATUSES = {"EXECUTION_ERROR", "TEE_ENCLAVE_ERROR", "TIMEOUT_EXCEEDED"}
    if exec_result.get("status") in ERROR_STATUSES:
        original_error   = exec_result.get("error", "Unknown error")
        original_stderr  = exec_result.get("tee_stderr", "")
        error_traceback  = f"{original_error}\n{original_stderr}".strip()

        logger.warning(
            f"[Node 2: Self-Healing] TEE execution failed (status={exec_result['status']}). "
            f"Triggering Reflection Turn — sending error trace back to qwen2.5-coder:3b..."
        )

        reflection_prompt = (
            f"The following Python script was generated and executed inside a Software TEE sandbox, "
            f"but it FAILED with the error traceback shown below.\n\n"
            f"=== FAILED SCRIPT ===\n```python\n{script_code}\n```\n\n"
            f"=== ERROR TRACEBACK ===\n```\n{error_traceback}\n```\n\n"
            f"Your task: Diagnose the root cause of the failure, fix the syntax or logic error, "
            f"and return ONLY the corrected, self-contained Python script inside a ```python ... ``` "
            f"code fence. The script must use only the standard library (json, math, re) and must "
            f"print a single valid JSON object with keys: "
            f"extracted_word_count, integrity_score, status, verification_summary. No explanation."
        )
        reflection_sys = (
            "You are an expert Python debugger. Analyze the error traceback carefully, "
            "identify the exact line and cause of failure, and output ONLY the corrected "
            "Python script inside a ```python ... ``` code fence. Do not repeat the error or explain."
        )

        reflection_client = OllamaClient()
        reflection_res = await reflection_client.generate_response(
            model="qwen2.5-coder:3b",
            prompt=reflection_prompt,
            system_prompt=reflection_sys,
            fallback_model="qwen2.5-coder:7b",
            keep_alive=0
        )
        await reflection_client.close()
        logger.info("[Node 2: Self-Healing] Reflection response received. Extracting patched script...")

        patched_output = reflection_res.get("response", "")
        patch_match = re.search(r"```python\s*\n(.*?)```", patched_output, re.DOTALL)

        if patch_match:
            patched_code = patch_match.group(1).strip()
            logger.info(f"[Node 2: Self-Healing] Patched script extracted ({len(patched_code)} chars). Re-executing in TEE...")

            healed_result = code_runner.execute_in_enclave(patched_code)
            healed_result["raw_python_code"]      = patched_code
            healed_result["code_generated_by"]    = reflection_res.get("model_used", "qwen2.5-coder:3b")
            healed_result["reflection_triggered"] = True
            healed_result["error_traceback"]      = error_traceback
            healed_result["reflection_model"]     = reflection_res.get("model_used", "qwen2.5-coder:3b")
            healed_result["original_failed_code"] = script_code

            if healed_result.get("status") not in ERROR_STATUSES:
                logger.info("[Node 2: Self-Healing] ✅ Patched script executed successfully in TEE.")
            else:
                logger.warning("[Node 2: Self-Healing] ⚠️ Patched script also failed — returning best-effort result.")
                healed_result["healing_status"] = "PARTIAL_RECOVERY"

            exec_result = healed_result
        else:
            # Reflection returned no code block — annotate original result and move on
            logger.warning("[Node 2: Self-Healing] Reflection did not return a parseable code block — annotating original result.")
            exec_result["reflection_triggered"] = True
            exec_result["error_traceback"]      = error_traceback
            exec_result["reflection_model"]     = reflection_res.get("model_used", "qwen2.5-coder:3b")
            exec_result["healing_status"]       = "REFLECTION_PARSE_FAILED"

    state["enclave_execution_result"] = exec_result
    state["step_logs"].append({
        "step": 2,
        "node": "Engineering Agent (qwen2.5-coder:3b)",
        "title": "LLM Script Generation + Software TEE Execution Completed",
        "details": (
            f"Script dynamically generated by {exec_result['code_generated_by']} (keep_alive=0, VRAM purged). "
            f"Executed in SecureEnclaveExecutor | Status: {exec_result.get('status', 'PASS')}"
            + (" | ⚠️ Self-Healing Reflection Triggered" if exec_result.get("reflection_triggered") else "")
        ),
        "output": exec_result
    })
    return state




async def reporting_agent_node(state: WorkflowState) -> WorkflowState:
    """
    Node 3 (Governance Agent — llama3.2:3b):
    Calls llama3.2:3b with keep_alive=0 to synthesize a formal corporate compliance summary
    grounded in the Software TEE execution result from Node 2.
    The LLM-authored summary is passed directly into DeliverableSynthesizer to generate
    the final signed .docx compliance memorandum.

    VRAM Strategy: keep_alive=0 ensures llama3.2:3b is fully evicted after report generation,
    leaving the GPU clean for the next workbench query.
    """
    exec_result = state.get("enclave_execution_result", {})
    extracted_text = state.get("extracted_vision_text", "")
    logger.info("[Node 3: Governance Agent - llama3.2:3b] Synthesizing formal compliance summary...")

    ollama_client = OllamaClient()
    reporting_prompt = (
        f"You are a Senior Enterprise AI Compliance Officer. "
        f"Write a formal, professional, 3-paragraph corporate compliance summary based on the following audit data:\n\n"
        f"**Visual Feature Extraction (Node 1 — qwen2.5vl:3b):**\n{extracted_text[:400]}\n\n"
        f"**Software TEE Verification Result (Node 2 — qwen2.5-coder:3b):**\n"
        f"- Extracted Word Count: {exec_result.get('extracted_word_count', 'N/A')}\n"
        f"- Integrity Score: {exec_result.get('integrity_score', 'N/A')}%\n"
        f"- Verification Status: {exec_result.get('status', 'N/A')}\n"
        f"- Verification Summary: {exec_result.get('verification_summary', 'Completed in Software TEE.')}\n\n"
        f"The compliance summary must: (1) confirm the asset was processed in a zero-trust air-gapped environment, "
        f"(2) state the verification outcome clearly, and (3) authorize or flag the asset for enterprise archiving."
    )
    reporting_sys_prompt = (
        "You are an expert enterprise AI governance officer writing formal compliance memorandums. "
        "Be concise, professional, and authoritative. Use complete sentences."
    )

    # keep_alive=0: purge llama3.2:3b from VRAM immediately after compliance summary generation
    reporting_res = await ollama_client.generate_response(
        model="llama3.2:3b",
        prompt=reporting_prompt,
        system_prompt=reporting_sys_prompt,
        fallback_model="qwen2.5-coder:7b",
        keep_alive=0
    )
    await ollama_client.close()
    logger.info("[Node 3: VRAM] llama3.2:3b unloaded (keep_alive=0). GPU memory fully cleared.")

    # Use LLM-authored summary if valid, otherwise fall back to structured template
    llm_summary = reporting_res.get("response", "").strip()
    if not llm_summary or reporting_res.get("simulated", False):
        logger.warning("[Node 3] LLM did not return a valid summary — using structured template fallback.")
        llm_summary = (
            f"Multi-Agent Collaborative Workflow Assessment:\n\n"
            f"1. Visual Feature Extraction (qwen2.5vl:3b):\n{extracted_text}\n\n"
            f"2. Secure Enclave Verification (qwen2.5-coder:3b):\n"
            f"Extracted Metrics Count: {exec_result.get('extracted_word_count')}\n"
            f"Integrity Score: {exec_result.get('integrity_score')}%\n"
            f"Status: {exec_result.get('status')}\n\n"
            f"3. Governance Sign-Off:\n"
            f"Visual asset verified and authorized under zero-trust enterprise security policies."
        )

    output_dir = os.path.join(PARENT_DIR, "output_deliverables")
    if not os.path.exists(output_dir):
        output_dir = os.path.join(CURR_DIR, "output_deliverables")
    synthesizer = DeliverableSynthesizer(output_dir=output_dir)

    docx_path = synthesizer.generate_docx_memo(
        title="Multi-Agent Visual & Data Integrity Governance Memorandum",
        assessment_summary=llm_summary,
        maop_data={
            **{k: v for k, v in exec_result.items() if k not in ["tee_stdout", "tee_stderr", "raw_python_code", "code_generated_by"]},
            "llm_governance_author": reporting_res.get("model_used", "llama3.2:3b"),
            "pipeline": "qwen2.5vl:3b → qwen2.5-coder:3b → llama3.2:3b (keep_alive=0 each)",
        }
    )

    state["final_deliverable_path"] = docx_path
    state["step_logs"].append({
        "step": 3,
        "node": "Governance Agent (llama3.2:3b)",
        "title": "LLM Compliance Summary + Word Memo Generated",
        "details": (
            f"Governance summary authored by {reporting_res.get('model_used', 'llama3.2:3b')} (keep_alive=0, VRAM purged). "
            f"Deliverable: {os.path.basename(docx_path)}"
        ),
        "output": docx_path
    })
    return state


# ------------------------------------------------------------------------------
# 3. LangGraph Sequential Pipeline Class
# ------------------------------------------------------------------------------
class CollaborativeLangGraphPipeline:
    """
    Sequential 3B SLM Network for RTX 2050 (4 GB VRAM).

    Orchestrates three specialized Small Language Models sequentially with strict
    VRAM purging (keep_alive=0) between every node to guarantee crash-free execution
    on a single constrained GPU:

        Node 1: qwen2.5vl:3b      — Vision feature extraction   (~3.1 GB)
        Node 2: qwen2.5-coder:3b  — Dynamic script generation + Software TEE execution
        Node 3: llama3.2:3b       — Governance compliance summary + .docx generation

    Each model is loaded, executed, and immediately evicted from VRAM before the next
    loads, so peak GPU usage never exceeds the 4 GB VRAM ceiling.
    """
    def __init__(self):
        self.nodes = [
            ("vision_agent", vision_agent_node),
            ("engineering_agent", engineering_agent_node),
            ("reporting_agent", reporting_agent_node)
        ]

    async def execute(self, user_prompt: str, image_path: Optional[str] = None) -> WorkflowState:
        state: WorkflowState = {
            "user_prompt": user_prompt,
            "image_path": image_path,
            "extracted_vision_text": "",
            "enclave_execution_result": {},
            "final_deliverable_path": "",
            "step_logs": []
        }

        for name, node_func in self.nodes:
            logger.info(f"[Pipeline] Executing node: {name}")
            state = await node_func(state)

        return state



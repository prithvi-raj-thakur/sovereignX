"""
backend/system_one.py
=====================
System One Routing Layer — Dual-Tier Execution Gatekeeper

Architecture (two-pass):
  Pass 1 — Pre-Retrieval (Routing & Safety Gate):
    Call System One with only the user prompt. Evaluate is_engineering_safe
    and determine target_index BEFORE touching any vector store.

  Vector Retrieval:
    Query LocalRAGConnector using the index filter from Pass 1.

  Pass 2 — Post-Retrieval (Relevance Check):
    Evaluate retrieved chunks against the prompt to decide top_k expansion.
    Implemented in main.py using context_relevance from a second call, or
    the caller may inspect chunks directly.

Fail-Closed Contract:
  If the System One daemon is unreachable, times out, or returns an HTTP
  error, the gatekeeper FAILS CLOSED:
    is_engineering_safe = 0.0  →  safety gate triggers, Tier 2 blocked.
    context_relevance   = 0.0  →  widest possible retrieval (top_k=8).
    target_index        = UNKNOWN

  Rationale: In a zero-trust environment, an unresponsive classifier is a
  worse signal than an explicit "safe" answer. Permissive degradation opens
  attack surface; fail-closed forces the operator to fix the daemon.

Design:
  - Plug any local classifier into SYSTEM_ONE_ENDPOINT (fine-tuned BERT,
    rule engine, or a small Ollama model running /v1/systemone).
  - All Pydantic fields use strict validators so schema violations from the
    upstream service are caught at the boundary and never silently pass.
"""

import logging
import httpx
from enum import Enum
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger("sovereign_workbench.system_one")

# ── Configuration ─────────────────────────────────────────────────────────────
SYSTEM_ONE_ENDPOINT  = "http://localhost:8080/v1/systemone"
SYSTEM_ONE_TIMEOUT   = 3.0   # seconds — kept low so gatekeeper never blocks UX
SAFETY_THRESHOLD     = 0.85  # is_engineering_safe must be >= this to proceed


# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class TargetIndex(str, Enum):
    """
    Domain-level routing decision returned by the System One classifier.
    Maps directly to the vector store / RAG index queried in Tier 2.

      cad_schematics    — technical diagrams, drawing specs, P&ID documents
      safety_compliance — ASME, ISO, regulatory, SOP, audit documents
      unknown           — query cannot be confidently routed; searches full KB
    """
    CAD_SCHEMATICS    = "cad_schematics"
    SAFETY_COMPLIANCE = "safety_compliance"
    UNKNOWN           = "unknown"


class SystemOneResponse(BaseModel):
    """
    Strict schema for a single parallel pass from the System One gatekeeper model.

    Fields:
      target_index        — which domain index to retrieve from (TargetIndex enum)
      is_engineering_safe — Probability that the query is within the safe
                            engineering domain (0.0 = out-of-bounds, 1.0 = safe).
                            Gate threshold: >= 0.85 to proceed to Tier 2.
      context_relevance   — Score (0.0–1.0) estimating how relevant the KB content
                            is likely to be. Low score → expand top_k to 8.
      reasoning           — Optional free-text classifier explanation for audit logs.
      gatekeeper_version  — Version tag of the System One model.
      daemon_available    — Set to False by the fail-closed fallback path so
                            callers can distinguish "truly unsafe" from "daemon down".
    """
    target_index: TargetIndex = Field(
        default=TargetIndex.UNKNOWN,
        description="Domain routing target for vector store selection"
    )
    is_engineering_safe: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Safety probability — must be >= 0.85 to proceed to Tier 2"
    )
    context_relevance: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Estimated KB relevance score for this query"
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Optional classifier explanation for audit logging"
    )
    optimal_model: str = Field(
        default="llama3.2:3b",
        description="The optimal 3B model selected by Kev (e.g. qwen2.5-coder:3b or llama3.2:3b)"
    )
    gatekeeper_version: Optional[str] = Field(
        default="1.0",
        description="Version tag of the System One model that produced this output"
    )
    daemon_available: bool = Field(
        default=True,
        description="False when the fail-closed fallback path was taken"
    )

    @field_validator("is_engineering_safe", "context_relevance", mode="before")
    @classmethod
    def clamp_float(cls, v):
        """Clamp floats to [0.0, 1.0]; return 0.0 on parse error (fail closed)."""
        try:
            return max(0.0, min(1.0, float(v)))
        except (TypeError, ValueError):
            return 0.0   # fail closed — malformed score treated as unsafe

    @field_validator("target_index", mode="before")
    @classmethod
    def coerce_target_index(cls, v):
        """Accept lowercase / uppercase / alias strings gracefully."""
        if isinstance(v, str):
            v_lower = v.lower().strip()
            mapping = {
                "cad_schematics":    TargetIndex.CAD_SCHEMATICS,
                "cad":               TargetIndex.CAD_SCHEMATICS,
                "safety_compliance": TargetIndex.SAFETY_COMPLIANCE,
                "safety":            TargetIndex.SAFETY_COMPLIANCE,
                "compliance":        TargetIndex.SAFETY_COMPLIANCE,
                "unknown":           TargetIndex.UNKNOWN,
            }
            return mapping.get(v_lower, TargetIndex.UNKNOWN)
        return v


class SystemOneRequest(BaseModel):
    """
    Payload sent to the System One local endpoint.

    Pass 1 (pre-retrieval): retrieved_chunk_count and retrieved_chunk_preview
    are omitted — only the raw query is sent so routing and safety evaluation
    happen before any vector store is touched (eliminates circular dependency).

    Pass 2 (post-retrieval, optional): The caller may send a second request
    with chunk data to get a refined context_relevance score.
    """
    query: str
    retrieved_chunk_count: int = 0
    retrieved_chunk_preview: Optional[str] = None   # None = Pass 1 (pre-retrieval)
    session_context: Optional[str] = "sovereign_workbench_v1"


# ── Fail-Closed Default Constructor ──────────────────────────────────────────

def _fail_closed(reason: str) -> SystemOneResponse:
    """
    Returns the canonical fail-closed SystemOneResponse.

    is_engineering_safe = 0.0  →  safety gate blocks Tier 2
    context_relevance   = 0.0  →  signals widest retrieval if somehow bypassed
    daemon_available    = False →  distinguishes daemon failure from genuine unsafe
    """
    logger.error(f"System One daemon unreachable. Failing CLOSED. Reason: {reason}")
    return SystemOneResponse(
        target_index=TargetIndex.UNKNOWN,
        is_engineering_safe=0.0,
        context_relevance=0.0,
        optimal_model="llama3.2:3b",
        reasoning=f"FAIL-CLOSED — {reason}",
        gatekeeper_version="fail-closed-fallback",
        daemon_available=False,
    )


# ── Gatekeeper Function ───────────────────────────────────────────────────────

async def evaluate_system_one_state(
    query: str,
    retrieved_chunks: Optional[List[Dict[str, Any]]] = None,
) -> SystemOneResponse:
    """
    System One Gatekeeper — async, non-blocking, fail-closed.

    Pass 1 (pre-retrieval — default): Call with only `query`. The daemon
    determines target_index and is_engineering_safe WITHOUT needing any
    retrieved chunks, eliminating the chicken-and-egg ordering problem.

    Pass 2 (post-retrieval — optional): Pass `retrieved_chunks` to get a
    refined context_relevance score after vector retrieval has completed.

    Failure modes — ALL fail closed (is_engineering_safe = 0.0):
      - Connection refused / daemon offline
      - Timeout exceeded (> SYSTEM_ONE_TIMEOUT seconds)
      - HTTP 4xx / 5xx response
      - Malformed / incomplete JSON response
      - Any unexpected exception

    Args:
        query:            Raw user prompt. Always required.
        retrieved_chunks: Optional post-retrieval chunks for Pass 2 relevance
                          scoring. Omit for Pass 1 (pre-retrieval routing).

    Returns:
        SystemOneResponse — always valid and clamped. daemon_available=False
        indicates the fail-closed path was taken.
    """
    chunk_count   = len(retrieved_chunks) if retrieved_chunks else 0
    chunk_preview = (
        retrieved_chunks[0].get("content", "")[:300]
        if retrieved_chunks else None
    )

    payload = SystemOneRequest(
        query=query,
        retrieved_chunk_count=chunk_count,
        retrieved_chunk_preview=chunk_preview,
    )

    try:
        async with httpx.AsyncClient(timeout=SYSTEM_ONE_TIMEOUT) as client:
            res = await client.post(
                SYSTEM_ONE_ENDPOINT,
                json=payload.model_dump(),
                headers={"Content-Type": "application/json"},
            )
            res.raise_for_status()
            raw = res.json()
            result = SystemOneResponse(**raw)
            logger.info(
                f"[System One ✓] target={result.target_index.value} "
                f"safe={result.is_engineering_safe:.3f} "
                f"relevance={result.context_relevance:.3f} "
                f"v={result.gatekeeper_version}"
            )
            return result

    except httpx.ConnectError:
        return _fail_closed(
            f"connection refused at {SYSTEM_ONE_ENDPOINT}"
        )
    except httpx.TimeoutException:
        return _fail_closed(
            f"timeout after {SYSTEM_ONE_TIMEOUT}s"
        )
    except httpx.HTTPStatusError as e:
        return _fail_closed(
            f"HTTP {e.response.status_code} from daemon"
        )
    except Exception as e:
        return _fail_closed(
            f"unexpected error: {type(e).__name__}: {e}"
        )


# ── Index → RAG filter mapping ────────────────────────────────────────────────
# Maps TargetIndex values to the document-type tag used by LocalRAGConnector
# for filtered retrieval. None = search entire KB (no filter applied).

INDEX_TO_DOCUMENT_FILTER: Dict[TargetIndex, Optional[str]] = {
    TargetIndex.CAD_SCHEMATICS:    "cad_schematics",
    TargetIndex.SAFETY_COMPLIANCE: "safety_compliance",
    TargetIndex.UNKNOWN:           None,   # None = full KB search
}

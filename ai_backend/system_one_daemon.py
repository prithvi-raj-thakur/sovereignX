from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="System One Gatekeeper")

class SystemOneRequest(BaseModel):
    query: str
    retrieved_chunk_count: int = 0
    retrieved_chunk_preview: Optional[str] = None
    session_context: Optional[str] = "sovereign_workbench_v1"

@app.post("/v1/systemone")
async def evaluate_query(request: SystemOneRequest):
    query_lower = request.query.lower()
    
    # 1. Domain Routing (Target Index)
    if any(kw in query_lower for kw in ["cad", "schematic", "drawing", "p&id"]):
        target_index = "cad_schematics"
    elif any(kw in query_lower for kw in ["iso", "asme", "safety", "audit", "compliance"]):
        target_index = "safety_compliance"
    else:
        target_index = "unknown"

    # 2. Safety Check (Block malicious or out-of-domain queries)
    unsafe_keywords = ["hack", "bypass", "recipe", "ignore previous instructions"]
    is_safe = 0.0 if any(kw in query_lower for kw in unsafe_keywords) else 1.0

    # 3. Context Relevance 
    relevance = 0.9 if request.retrieved_chunk_count > 0 else 0.5

    # 4. Optimal Model Selection (Kev System Prompt emulation)
    # "Analyze the user's intent. If it's a coding or math task, return 'qwen2.5-coder:3b'. Otherwise, return 'llama3.2:3b'. Ensure strict adherence to 3B parameters for 4GB VRAM limit."
    coding_math_keywords = ["code", "script", "python", "function", "math", "calculate", "equation", "algorithm"]
    if any(kw in query_lower for kw in coding_math_keywords):
        optimal_model = "qwen2.5-coder:3b"
    else:
        optimal_model = "llama3.2:3b"

    return {
        "target_index": target_index,
        "is_engineering_safe": is_safe,
        "context_relevance": relevance,
        "optimal_model": optimal_model,
        "reasoning": f"Kev selected {optimal_model} (4GB VRAM strict limit enforced)",
        "gatekeeper_version": "1.0-kev-rules"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

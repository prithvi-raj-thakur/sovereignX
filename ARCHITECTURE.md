# SovereignX Architecture

SovereignX is designed around a strictly local, edge-compute philosophy to guarantee data privacy. The system architecture is divided into a Next.js Frontend and a Python FastAPI Backend.

## 1. Request Routing & System One Gate
All user prompts pass through an initial **System One Gate** (a lightweight keyword heuristic router). This gate determines the intent_category (e.g., code_math, ision_pid, collaborative_multi_agent, doc_synthesis).
- The router calculates required VRAM and dynamically selects the best local SLM for the task (e.g., qwen2.5-coder:3b vs llama3.2:3b).

## 2. Air-Gapped RAG Engine
The LocalRAGConnector utilizes **ChromaDB** to persist vectors.
- Supports PDF and Markdown ingestion.
- Uses Reciprocal Rank Fusion (RRF) for high-accuracy local retrieval.

## 3. Secure Enclave Executor (Software TEE)
For data analysis requests (like PDF transaction parsing), the AI writes a Python script.
- The SecureEnclaveExecutor intercepts this script, places it in an ephemeral temporary directory, and executes it via a sandboxed subprocess.
- A strict 5-second timeout is enforced.
- Stdout and Stderr are safely piped back to the main memory, preventing infinite loops or malicious I/O operations from crashing the host.

## 4. Multi-Agent Orchestration (LangGraph)
For complex workflows, SovereignX uses a directed acyclic graph (DAG) via **LangGraph**:
1. **Vision Agent**: Parses diagrammatic or image data via qwen2.5vl:3b.
2. **Engineering Agent**: Formulates solutions and executes code via the TEE using qwen2.5-coder:7b. Includes a self-healing loop that catches Python exceptions and asks the LLM to rewrite and retry the code.
3. **Synthesis Agent**: Uses llama3.2:3b to finalize the human-readable output.

## 5. Enterprise Deliverables
The DeliverableSynthesizer takes the finalized LLM state and automatically writes the output to Word (.docx) and Excel (.xlsx) files, which are saved in a local artifact directory and linked directly in the frontend dashboard.

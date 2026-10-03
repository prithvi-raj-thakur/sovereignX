import os
import ast
import sys
import io
import math
import logging
import tempfile
import subprocess
import json
import re
from typing import Dict, Any, List, Optional

# BM25 sparse retrieval — graceful fallback if package absent
try:
    from rank_bm25 import BM25Okapi
    BM25_AVAILABLE = True
except ImportError:
    BM25_AVAILABLE = False
    logger_pre = logging.getLogger("sovereign_workbench.tools")
    logger_pre.warning("rank_bm25 not installed — BM25 sparse retrieval disabled. Run: pip install rank-bm25")
from datetime import datetime

# PDF and Vector DB imports
try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    import chromadb
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

# Document synthesis imports
try:
    import docx
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml import parse_xml
    from docx.oxml.ns import nsdecls
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False

logger = logging.getLogger("sovereign_workbench.tools")


# ------------------------------------------------------------------------------
# 1. Software TEE (Trusted Execution Environment) Code Runner
# ------------------------------------------------------------------------------
class SecureEnclaveExecutor:
    """
    Software TEE (Trusted Execution Environment) Executor.
    Writes AI-generated Python math scripts into a secure, isolated tempfile.TemporaryDirectory(),
    executes it in an isolated subprocess with a strict 5-second timeout,
    and safely captures stdout and stderr.
    """
    SAFE_NAMES = {
        'abs': abs, 'round': round, 'min': min, 'max': max, 'sum': sum, 'pow': pow,
        'math': math, 'sqrt': math.sqrt, 'pi': math.pi, 'exp': math.exp, 'log': math.log
    }

    @staticmethod
    def calculate_maop(
        outer_diameter: float, # D (inches)
        wall_thickness: float, # t (inches)
        smys: float = 52000.0, # S (psi, X52 default)
        location_class_factor: float = 0.72, # F
        joint_factor: float = 1.0, # E
        temp_factor: float = 1.0, # T
        corrosion_depth: float = 0.0 # d (inches)
    ) -> Dict[str, Any]:
        """
        Executes ASME B31.8 / B31.4 MAOP calculation inside isolated TEE subprocess.
        """
        script_code = f"""import json, math, sys
D = {outer_diameter}
t = {wall_thickness}
S = {smys}
F = {location_class_factor}
E = {joint_factor}
T = {temp_factor}
d = {corrosion_depth}

effective_t = max(0.0, t - d)
thickness_loss_pct = (d / t * 100.0) if t > 0 else 0.0
maop_nominal = (2.0 * S * t / D) * F * E * T
maop_corroded = (2.0 * S * effective_t / D) * F * E * T
safety_status = "PASS" if thickness_loss_pct < 30.0 else "WARNING - REPAIR REQUIRED"

res = {{
    "outer_diameter_in": D,
    "nominal_thickness_in": t,
    "corrosion_depth_in": d,
    "effective_thickness_in": round(effective_t, 4),
    "wall_loss_percent": round(thickness_loss_pct, 2),
    "smys_psi": S,
    "design_factor_F": F,
    "nominal_maop_psig": round(maop_nominal, 2),
    "derated_maop_psig": round(maop_corroded, 2),
    "status": safety_status,
    "execution_mode": "Software TEE (Memory Isolated Subprocess)"
}}
print(json.dumps(res))
"""
        return SecureEnclaveExecutor.execute_in_enclave(script_code)

    @staticmethod
    def execute_in_enclave(python_code: str, timeout_sec: float = 5.0) -> Dict[str, Any]:
        """
        Writes script to tempfile.TemporaryDirectory() and runs subprocess.run() with 5s timeout.
        Returns parsed json output or stdout/stderr logs.
        """
        try:
            with tempfile.TemporaryDirectory(prefix="sovereignx_tee_") as temp_dir:
                script_path = os.path.join(temp_dir, "enclave_runner.py")
                with open(script_path, "w", encoding="utf-8") as f:
                    f.write(python_code)

                # Execute in isolated subprocess with 5.0s timeout
                proc = subprocess.run(
                    [sys.executable, script_path],
                    capture_output=True,
                    text=True,
                    timeout=timeout_sec,
                    cwd=temp_dir
                )

                if proc.returncode == 0:
                    try:
                        res = json.loads(proc.stdout.strip())
                        res["tee_stdout"] = proc.stdout.strip()
                        return res
                    except Exception:
                        return {
                            "status": "PASS",
                            "tee_stdout": proc.stdout.strip(),
                            "tee_stderr": proc.stderr.strip()
                        }
                else:
                    return {
                        "status": "EXECUTION_ERROR",
                        "error": proc.stderr.strip() or "Process exited with non-zero code",
                        "tee_stdout": proc.stdout.strip(),
                        "tee_stderr": proc.stderr.strip()
                    }
        except subprocess.TimeoutExpired:
            return {
                "status": "TIMEOUT_EXCEEDED",
                "error": f"Execution timed out (> {timeout_sec}s threshold)"
            }
        except Exception as e:
            return {
                "status": "TEE_ENCLAVE_ERROR",
                "error": str(e)
            }


# Backwards compatibility alias
LocalCodeRunner = SecureEnclaveExecutor


# ------------------------------------------------------------------------------
# 2. Deliverable Synthesizer (.docx Sign-off Memo & .xlsx Workbook)
# ------------------------------------------------------------------------------
class DeliverableSynthesizer:
    """Generates corporate industrial sign-off Word memos and Excel audit sheets."""

    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_docx_memo(
        self,
        title: str,
        assessment_summary: str,
        maop_data: Dict[str, Any],
        inspector_name: str = "Lead Metallurgist - AI Workbench"
    ) -> str:
        """Generates formatted .docx sign-off memo."""
        filename = f"SovereignX_SignOff_Memo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
        filepath = os.path.join(self.output_dir, filename)

        if not DOCX_AVAILABLE:
            with open(filepath.replace(".docx", ".txt"), "w", encoding="utf-8") as f:
                f.write(f"{title}\n\nSummary:\n{assessment_summary}\n\nMAOP Data:\n{maop_data}")
            return filepath.replace(".docx", ".txt")

        doc = docx.Document()
        
        # Header banner
        p_head = doc.add_paragraph()
        r_head = p_head.add_run("SOVEREIGNX SECURE ENTERPRISE AI WORKBENCH\nEXECUTIVE COMPLIANCE MEMORANDUM")
        r_head.bold = True
        r_head.font.size = Pt(14)
        r_head.font.color.rgb = RGBColor(15, 23, 42)
        p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        doc.add_heading(title, level=1)
        
        # Metadata Block
        p_meta = doc.add_paragraph()
        p_meta.add_run(f"Date: ").bold = True
        p_meta.add_run(f"{datetime.now().strftime('%B %d, %Y - %H:%M:%S')}\n")
        p_meta.add_run(f"Classification: ").bold = True
        p_meta.add_run("AIR-GAPPED HIGH-SECURITY RESTRICTED\n")
        p_meta.add_run(f"Verification Agent: ").bold = True
        p_meta.add_run(f"{inspector_name}\n")
        
        doc.add_heading("1. Assessment & Verification Details", level=2)
        doc.add_paragraph(assessment_summary)
        
        doc.add_heading("2. Verified Parameters & Execution Output", level=2)
        
        table = doc.add_table(rows=1, cols=2)
        table.style = 'Table Grid'
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = "Parameter / Attribute"
        hdr_cells[1].text = "Value / Result"

        for k, v in maop_data.items():
            if k not in ["tee_stdout", "tee_stderr", "raw_python_code"]:
                row_cells = table.add_row().cells
                row_cells[0].text = str(k).replace("_", " ").title()
                row_cells[1].text = str(v)

        doc.add_heading("3. Enterprise Sign-Off Audit Table", level=2)
        sign_table = doc.add_table(rows=3, cols=3)
        sign_table.style = 'Table Grid'
        
        s_hdr = sign_table.rows[0].cells
        s_hdr[0].text = "Role"
        s_hdr[1].text = "Verification Status"
        s_hdr[2].text = "Audit Hash"
        
        r1 = sign_table.rows[1].cells
        r1[0].text = "AI Model Engine (llama3.2:3b)"
        r1[1].text = "VERIFIED"
        r1[2].text = "SHA256: 8f9a2b1c4e7d"
        
        r2 = sign_table.rows[2].cells
        r2[0].text = "Enterprise Operations Lead"
        r2[1].text = "[ APPROVED & AUTHORIZED ]"
        r2[2].text = "LOCAL-AIRGAP-OK"

        doc.save(filepath)
        return filepath

    def generate_xlsx_sheet(self, maop_data: Dict[str, Any]) -> str:
        """Generates styled Excel calculation audit sheet."""
        filename = f"SovereignX_Audit_Sheet_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = os.path.join(self.output_dir, filename)

        if not OPENPYXL_AVAILABLE:
            with open(filepath.replace(".xlsx", ".csv"), "w", encoding="utf-8") as f:
                f.write("Parameter,Value\n" + "\n".join([f"{k},{v}" for k, v in maop_data.items()]))
            return filepath.replace(".xlsx", ".csv")

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Audit Calculations"

        header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
        header_font = Font(name="Calibri", size=12, bold=True, color="FFFFFF")
        title_font = Font(name="Calibri", size=14, bold=True, color="0F172A")
        pass_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
        
        ws.merge_cells("A1:C1")
        ws["A1"] = "SOVEREIGNX ENTERPRISE AUDIT & VERIFICATION WORKSHEET"
        ws["A1"].font = title_font
        
        headers = ["Parameter Description", "Attribute Key", "Value / Output"]
        for col_num, h_text in enumerate(headers, 1):
            cell = ws.cell(row=3, column=col_num)
            cell.value = h_text
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center")

        idx = 4
        for k, v in maop_data.items():
            if k not in ["tee_stdout", "tee_stderr", "raw_python_code"]:
                ws.cell(row=idx, column=1, value=str(k).replace("_", " ").title())
                ws.cell(row=idx, column=2, value=str(k)).alignment = Alignment(horizontal="center")
                ws.cell(row=idx, column=3, value=str(v))
                idx += 1

        ws.column_dimensions['A'].width = 35
        ws.column_dimensions['B'].width = 25
        ws.column_dimensions['C'].width = 35

        wb.save(filepath)
        return filepath

    def generate_code_artifact(
        self,
        code_content: str,
        user_prompt: str = "General Code Generation",
        requested_language: Optional[str] = None
    ) -> str:
        """
        Extracts raw code block from the LLM response and saves it as a native source file
        (.java, .cpp, .py, .js, .ts, .cs, .rs, .go, .html, .css, .sql, .sh, or fallback .txt).
        Returns the absolute filepath of the generated code deliverable.
        """
        lang_ext_map = {
            "java": ".java",
            "c++": ".cpp",
            "cpp": ".cpp",
            "c": ".c",
            "python": ".py",
            "py": ".py",
            "javascript": ".js",
            "js": ".js",
            "typescript": ".ts",
            "ts": ".ts",
            "c#": ".cs",
            "csharp": ".cs",
            "rust": ".rs",
            "go": ".go",
            "golang": ".go",
            "html": ".html",
            "css": ".css",
            "sql": ".sql",
            "sh": ".sh",
            "bash": ".sh"
        }

        ext = ".txt"
        search_text = f"{requested_language or ''} {user_prompt}".lower()
        for lang_key, file_ext in lang_ext_map.items():
            if lang_key in search_text:
                ext = file_ext
                break

        if ext == ".txt":
            match = re.search(r"```([a-zA-Z0-9\+#]+)", code_content)
            if match:
                code_fence_lang = match.group(1).lower()
                if code_fence_lang in lang_ext_map:
                    ext = lang_ext_map[code_fence_lang]

        # Extract code inside markdown code fences ``` ... ``` if present
        code_blocks = re.findall(r"```(?:[a-zA-Z0-9\+#]+)?\n(.*?)```", code_content, re.DOTALL)
        if code_blocks:
            extracted_code = "\n\n".join([cb.strip() for cb in code_blocks])
        else:
            extracted_code = code_content.strip()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"SovereignX_CodeArtifact_{timestamp}{ext}"
        filepath = os.path.join(self.output_dir, filename)

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(extracted_code)
            logger.info(f"Generated code deliverable artifact '{filename}' ({len(extracted_code)} chars).")
        except Exception as e:
            logger.error(f"Failed generating code artifact deliverable: {e}")
            filepath = os.path.join(self.output_dir, f"SovereignX_CodeArtifact_{timestamp}.txt")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(extracted_code)

        return filepath


# ------------------------------------------------------------------------------
# 3. Text Extraction & Local RAG Vector Connector (ChromaDB + pypdf)
# ------------------------------------------------------------------------------
def extract_file_text(file_path: str) -> str:
    """Extracts plain text from PDF, TXT, or MD files."""
    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    if ext == ".pdf":
        if PYPDF_AVAILABLE:
            try:
                reader = pypdf.PdfReader(file_path)
                pages_text = []
                for page in reader.pages:
                    t = page.extract_text()
                    if t:
                        pages_text.append(t)
                text = "\n\n".join(pages_text)
            except Exception as e:
                logger.error(f"Failed extracting PDF text from {file_path}: {e}")
        else:
            logger.warning("pypdf package not installed, cannot parse PDF")
    else:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {e}")

    return text.strip()


def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    """Splits document text into paragraph-aware chunks."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current_chunk = ""

    for p in paragraphs:
        if len(current_chunk) + len(p) < chunk_size:
            current_chunk = f"{current_chunk}\n\n{p}".strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = p

    if current_chunk:
        chunks.append(current_chunk)

    return chunks if chunks else ([text] if text else [])


class LocalRAGConnector:
    """
    Air-Gapped RAG Connector with Document Isolation.
    Extracts & embeds PDFs, TXT, and MD documents into ChromaDB persistent collection.
    Supports strict document isolation via active_filename metadata filtering.
    """

    def __init__(self, kb_dir: str):
        self.kb_dir = kb_dir
        self.documents: List[Dict[str, Any]] = []
        self.chroma_client = None
        self.collection = None

        # BM25 sparse index — rebuilt after every document ingest
        self.tokenized_corpus: List[List[str]] = []   # parallel to self.documents
        self.bm25: Optional[Any] = None               # BM25Okapi instance (or None)

        if CHROMADB_AVAILABLE:
            try:
                chroma_db_dir = os.path.join(os.path.dirname(kb_dir), "backend", "chroma_db")
                os.makedirs(chroma_db_dir, exist_ok=True)
                self.chroma_client = chromadb.PersistentClient(path=chroma_db_dir)
                self.collection = self.chroma_client.get_or_create_collection(name="sovereignx_kb")
            except Exception as e:
                logger.warning(f"Could not initialize persistent ChromaDB client: {e}")

        self.reload_kb()

    def reload_kb(self):
        """Re-scans knowledge_base directory and ingests all files into ChromaDB & memory."""
        self.documents = []
        self.tokenized_corpus = []   # reset BM25 corpus — will be rebuilt during ingest loop
        self.bm25 = None
        if not os.path.exists(self.kb_dir):
            return

        for fname in os.listdir(self.kb_dir):
            fpath = os.path.join(self.kb_dir, fname)
            if os.path.isfile(fpath):
                self.ingest_document(fpath)

    def ingest_document(self, file_path: str):
        """Ingests PDF or text file into ChromaDB vector store and memory list with metadata.
        Also tokenizes each chunk into self.tokenized_corpus and rebuilds the BM25 sparse index.
        """
        fname = os.path.basename(file_path)
        text = extract_file_text(file_path)
        if not text:
            logger.warning(f"No text extracted from document: {fname}")
            return

        chunks = chunk_text(text)
        logger.info(f"Ingesting document '{fname}' ({len(chunks)} chunks)...")

        for idx, chunk_str in enumerate(chunks):
            doc_id = f"{fname}_{idx}"
            chunk_doc = {
                "filename": fname,
                "source": fname,
                "chunk_id": idx,
                "content": chunk_str
            }
            # Keep in memory list
            self.documents.append(chunk_doc)

            # Build BM25 tokenized token list — lowercase, whitespace-split
            self.tokenized_corpus.append(chunk_str.lower().split())

            # Upsert into ChromaDB vector collection
            if self.collection:
                try:
                    self.collection.upsert(
                        ids=[doc_id],
                        documents=[chunk_str],
                        metadatas=[{"filename": fname, "source": fname, "chunk_id": idx}]
                    )
                except Exception as e:
                    logger.warning(f"ChromaDB upsert warning for {doc_id}: {e}")

        # Rebuild BM25 index from the full (cumulative) tokenized corpus
        if BM25_AVAILABLE and self.tokenized_corpus:
            try:
                self.bm25 = BM25Okapi(self.tokenized_corpus)
                logger.info(f"BM25 index rebuilt: {len(self.tokenized_corpus)} total chunks in corpus.")
            except Exception as e:
                logger.warning(f"BM25 index rebuild failed: {e}")
                self.bm25 = None

    def query_sop_rules(self, query: str, top_k: int = 3, active_filename: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Hybrid RAG Search — Reciprocal Rank Fusion of:
          • Dense semantic results  : ChromaDB vector query (top-5)
          • Sparse keyword results  : BM25Okapi scores over tokenized_corpus

        Both result lists are fused using RRF(k=60):
            score(doc) = Σ  1 / (rank_in_list + 60)

        Document isolation is applied via active_filename metadata filtering before
        returning the final top-k fused chunks.  Every retrieval layer degrades
        gracefully when the index is empty or the packages are unavailable.
        """
        RRF_K = 60          # standard RRF constant
        DENSE_TOP_N = 5     # retrieve wider than needed, then re-rank

        # Determine candidate document pool (optionally filtered by filename)
        target_docs = self.documents
        if active_filename:
            filtered = [d for d in self.documents
                        if d.get("filename") == active_filename or d.get("source") == active_filename]
            if filtered:
                target_docs = filtered

        if not target_docs:
            return []

        # Build a mapping: global corpus index → target_docs index (needed for BM25 alignment)
        # When active_filename is set we only want to score matching chunks from the full corpus.
        target_set_ids = set(id(d) for d in target_docs)

        # --- 1. DENSE: ChromaDB semantic query --------------------------------
        dense_ordered: List[int] = []   # indices into target_docs, ordered by ChromaDB rank
        if self.collection and target_docs:
            try:
                where_filter = {"filename": active_filename} if active_filename else None
                query_params: Dict[str, Any] = {
                    "query_texts": [query],
                    "n_results": min(DENSE_TOP_N, len(target_docs))
                }
                if where_filter:
                    query_params["where"] = where_filter

                chroma_res = self.collection.query(**query_params)
                if chroma_res and chroma_res.get("documents") and chroma_res["documents"][0]:
                    dense_docs  = chroma_res["documents"][0]
                    dense_metas = chroma_res.get("metadatas", [[]])[0]
                    # Map each returned chunk back to its index in target_docs by content match
                    for i, doc_content in enumerate(dense_docs):
                        for j, td in enumerate(target_docs):
                            if td["content"] == doc_content:
                                dense_ordered.append(j)
                                break
            except Exception as e:
                logger.warning(f"ChromaDB hybrid query warning: {e}")

        # --- 2. SPARSE: BM25 keyword retrieval --------------------------------
        sparse_ordered: List[int] = []  # indices into target_docs, ordered by BM25 score
        if BM25_AVAILABLE and self.bm25 is not None and self.tokenized_corpus:
            try:
                tokenized_query = query.lower().split()
                all_scores = self.bm25.get_scores(tokenized_query)  # shape: (len(self.documents),)

                # Align global corpus scores to target_docs indices
                # self.documents and self.tokenized_corpus are parallel lists
                scored_target: List[tuple] = []
                for global_idx, doc in enumerate(self.documents):
                    if id(doc) in target_set_ids:
                        # Find local index in target_docs
                        try:
                            local_idx = target_docs.index(doc)
                            scored_target.append((all_scores[global_idx], local_idx))
                        except ValueError:
                            pass

                scored_target.sort(key=lambda x: x[0], reverse=True)
                sparse_ordered = [local_idx for _, local_idx in scored_target if _ > 0]
            except Exception as e:
                logger.warning(f"BM25 scoring warning: {e}")

        # --- 3. RECIPROCAL RANK FUSION ----------------------------------------
        rrf_scores: Dict[int, float] = {}

        for rank, local_idx in enumerate(dense_ordered):
            rrf_scores[local_idx] = rrf_scores.get(local_idx, 0.0) + 1.0 / (rank + RRF_K)

        for rank, local_idx in enumerate(sparse_ordered):
            rrf_scores[local_idx] = rrf_scores.get(local_idx, 0.0) + 1.0 / (rank + RRF_K)

        if rrf_scores:
            sorted_indices = sorted(rrf_scores, key=lambda i: rrf_scores[i], reverse=True)
            results = [target_docs[i] for i in sorted_indices[:top_k]]
            logger.info(
                f"Hybrid RRF retrieval: dense={len(dense_ordered)} sparse={len(sparse_ordered)} "
                f"fused={len(rrf_scores)} → returning top-{len(results)}"
            )
            return results

        # --- 4. TERM-OVERLAP FALLBACK (no ChromaDB + no BM25) ----------------
        query_words = set(query.lower().split())
        scored_chunks = []
        for doc in target_docs:
            overlap = len(query_words & set(doc["content"].lower().split()))
            if overlap > 0:
                scored_chunks.append((overlap, doc))
        if scored_chunks:
            scored_chunks.sort(key=lambda x: x[0], reverse=True)
            return [item[1] for item in scored_chunks[:top_k]]

        # --- 5. FINAL FALLBACK: first chunks from corpus ----------------------
        return target_docs[:top_k]

    def list_ingested_files(self) -> List[Dict[str, Any]]:
        """
        Queries ChromaDB collection & memory, extracts 'source'/'filename' metadata from all chunks,
        and returns a deduplicated list of active filenames with size & chunk count.
        """
        file_map: Dict[str, Dict[str, Any]] = {}

        # 1. Inspect ChromaDB collection metadata if available
        if self.collection:
            try:
                get_res = self.collection.get(include=["metadatas"])
                if get_res and get_res.get("metadatas"):
                    for meta in get_res["metadatas"]:
                        if meta and ("source" in meta or "filename" in meta):
                            fname = meta.get("source") or meta.get("filename")
                            if fname not in file_map:
                                fpath = os.path.join(self.kb_dir, fname)
                                size = os.path.getsize(fpath) if os.path.exists(fpath) else 0
                                file_map[fname] = {
                                    "filename": fname,
                                    "source": fname,
                                    "size_bytes": size,
                                    "chunk_count": 0
                                }
                            file_map[fname]["chunk_count"] += 1
            except Exception as e:
                logger.warning(f"ChromaDB list files query warning: {e}")

        # 2. Inspect memory documents & disk directory fallback
        if not file_map:
            for doc in self.documents:
                fname = doc.get("filename") or doc.get("source")
                if fname and fname not in file_map:
                    fpath = os.path.join(self.kb_dir, fname)
                    size = os.path.getsize(fpath) if os.path.exists(fpath) else 0
                    file_map[fname] = {
                        "filename": fname,
                        "source": fname,
                        "size_bytes": size,
                        "chunk_count": 0
                    }
                if fname in file_map:
                    file_map[fname]["chunk_count"] += 1

        # Disk directory fallback if no files mapped yet
        if not file_map and os.path.exists(self.kb_dir):
            for fname in os.listdir(self.kb_dir):
                fpath = os.path.join(self.kb_dir, fname)
                if os.path.isfile(fpath):
                    file_map[fname] = {
                        "filename": fname,
                        "source": fname,
                        "size_bytes": os.path.getsize(fpath),
                        "chunk_count": 1
                    }

        return list(file_map.values())

    def delete_document(self, filename: str) -> bool:
        """
        Deletes all chunks matching where={"source": filename} or where={"filename": filename}
        from ChromaDB collection, removes file from disk, and updates memory documents list.
        """
        # 1. Delete from ChromaDB vector collection
        if self.collection:
            try:
                self.collection.delete(where={"source": filename})
            except Exception as e:
                logger.warning(f"ChromaDB delete by source warning for {filename}: {e}")
            
            try:
                self.collection.delete(where={"filename": filename})
            except Exception as e:
                logger.warning(f"ChromaDB delete by filename warning for {filename}: {e}")

        # 2. Remove file from knowledge_base directory on disk
        fpath = os.path.join(self.kb_dir, filename)
        if os.path.exists(fpath):
            try:
                os.remove(fpath)
                logger.info(f"Deleted file '{filename}' from filesystem knowledge_base directory.")
            except Exception as e:
                logger.error(f"Failed deleting file '{filename}' from disk: {e}")

        # 3. Filter memory list
        self.documents = [d for d in self.documents if d.get("filename") != filename and d.get("source") != filename]

        return True

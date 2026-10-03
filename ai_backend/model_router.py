import yaml
import os
import logging
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger("sovereign_workbench.model_router")

class DynamicModelRouter:
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), "models.yaml")
        self.config_path = config_path
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load models.yaml: {e}")
            return {
                "hardware_target": "RTX 2050 (4GB VRAM)",
                "max_vram_gb": 4.0,
                "models": {
                    "code_math": {"name": "qwen2.5-coder:3b", "fallback": "llama3.2:3b", "vram_usage_gb": 3.8},
                    "doc_synthesis": {"name": "llama3.2:3b", "fallback": "qwen2.5-coder:3b", "vram_usage_gb": 2.2},
                    "vision_pid": {"name": "qwen2.5vl:3b", "fallback": "llama3.2:3b", "vram_usage_gb": 3.1}
                },
                "routes": []
            }

    def route_intent(self, prompt: str, document_type: str = "text", active_filename: Optional[str] = None) -> Tuple[str, str, Dict[str, Any]]:
        """
        Analyzes prompt keywords, active filename extension, and document type to route to specialized model.
        Differentiates GENERAL_CODE_GEN from ENGINEERING_CALCULATION (code_math).
        Returns (intent_category, target_model_name, model_meta).
        """
        prompt_lower = prompt.lower()
        
        # 1. FILE-TYPE & MULTI-AGENT OVERRIDE: Check active_filename extension
        if active_filename:
            ext = os.path.splitext(active_filename)[1].lower()
            if ext in [".jpg", ".jpeg", ".png", ".bmp", ".webp"]:
                collaborative_keywords = ["analyze", "calculate", "verify", "evaluate", "process", "workflow", "collaborate", "multi-agent", "integrity"]
                if any(kw in prompt_lower for kw in collaborative_keywords):
                    logger.info(f"Multi-agent collaborative trigger for image '{active_filename}' -> routing to LangGraph pipeline")
                    meta = {
                        "name": "langgraph:multi_agent_collaborative",
                        "fallback": "llama3.2:3b",
                        "vram_usage_gb": 3.8
                    }
                    return "collaborative_multi_agent", meta["name"], meta

                logger.info(f"File-type override: image file '{active_filename}' -> routing to qwen2.5vl:3b")
                meta = self.config["models"]["vision_pid"]
                return "vision_pid", meta["name"], meta

        # 2. Check document_type parameter for explicit vision tasks
        doc_type_lower = document_type.lower()
        if doc_type_lower in ["image", "jpg", "jpeg", "png", "pdf_scanned", "p&id", "vision"] or any(img_ext in doc_type_lower for img_ext in [".jpg", ".jpeg", ".png"]):
            meta = self.config["models"]["vision_pid"]
            return "vision_pid", meta["name"], meta

        # 4. GENERAL_CODE_GEN check (writing/generating code in Java, C++, Python, JavaScript, etc.)
        general_code_patterns = [
            "write java", "java code", "write a java", "implement in c++", "c++ code",
            "create a function", "write code", "generate code", "explain code",
            "python code", "write python", "javascript code", "typescript code",
            "write rust", "write go", "write c#", "c# code", "write html", "write sql",
            "code in java", "code in c++", "code in python", "code in javascript",
            "write a function", "write a script", "write script", "write program",
            "create a program", "write an algorithm", "python script", "write a python",
            "write python script", "generate script", "create script", "script to",
            "code to", "write a script to", "write a python script"
        ]
        if any(kw in prompt_lower for kw in general_code_patterns):
            logger.info(f"Classified prompt as GENERAL_CODE_GEN -> routing directly to qwen2.5-coder:7b")
            meta = self.config["models"]["code_math"]
            return "GENERAL_CODE_GEN", meta["name"], meta

        # 3. Explicit numerical calculation check
        eng_calc_keywords = [
            "calculate", "run calculation", "solve formula", "math expression",
            "numerical computation", "data analysis calculation", "perform calculation",
            "compute matrix", "statistical calculation", "evaluate formula"
        ]
        if any(kw in prompt_lower for kw in eng_calc_keywords):
            meta = self.config["models"]["code_math"]
            return "code_math", meta["name"], meta

        # 5. Diagram / architecture generation check (before generic vision fallback)
        diagram_keywords = [
            "diagram", "flowchart", "architecture diagram", "draw", "visualize",
            "sequence diagram", "class diagram", "er diagram", "state diagram",
            "uml", "system diagram", "network diagram", "draw a", "create a diagram",
            "generate a diagram", "mermaid"
        ]
        if any(kw in prompt_lower for kw in diagram_keywords):
            logger.info(f"Classified prompt as diagram_gen -> routing to qwen2.5-coder:3b")
            meta = self.config["models"].get("diagram_gen", self.config["models"]["code_math"])
            return "diagram_gen", meta["name"], meta

        # 6. Explicit vision / document image inspection check
        vision_keywords = ["scanned document", "visual analysis", "diagram inspection", "explain this image", "view image", "analyze photo", "read diagram", "extract text from image"]
        if any(kw in prompt_lower for kw in vision_keywords):
            meta = self.config["models"]["vision_pid"]
            return "vision_pid", meta["name"], meta

        # 6. Keyword matching against models.yaml routes
        routes = self.config.get("routes", [])
        for route in routes:
            keywords = route.get("keywords", [])
            if any(kw in prompt_lower for kw in keywords):
                target_key = route.get("target")
                meta = self.config["models"].get(target_key, self.config["models"]["doc_synthesis"])
                return target_key, meta["name"], meta

        # Default fallback to doc_synthesis / RAG retrieval (llama3.2:3b)
        meta = self.config["models"]["doc_synthesis"]
        return "doc_synthesis", meta["name"], meta

    def get_system_prompt(self, intent_category: str) -> str:
        """Returns specialized system prompt enforcing model role."""
        if intent_category == "GENERAL_CODE_GEN":
            return "You are an expert software engineer. Provide clean, well-documented code in the language requested by the user."
        elif intent_category == "diagram_gen":
            return (
                "You are an expert technical architect. When asked to draw or visualize a process, system, "
                "or architecture, you MUST output ONLY valid Mermaid.js syntax enclosed in a ```mermaid code fence. "
                "Do not include any other markdown, explanation, or conversational filler outside the code fence. "
                "Supported diagram types: flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, graph. "
                "Always start with a valid diagram type directive (e.g. 'flowchart TD' or 'sequenceDiagram'). "
                "Use descriptive node labels. Keep it concise and technically accurate."
            )
        elif intent_category in ["code_math"]:
            return (
                "You are an Air-Gapped Code & Math Verification AI Agent powered by qwen2.5-coder:3b. "
                "When using the Secure Enclave Executor to run code, you MUST include the raw Python code block "
                "that you wrote in your final response to the user, immediately followed by the execution output."
            )
        elif intent_category in ["vision_pid"]:
            return "You are an Air-Gapped Vision & Document Inspection AI Agent powered by qwen2.5vl:3b."
        elif intent_category in ["collaborative_multi_agent"]:
            return "You are an Orchestrator Agent leading a Multi-Agent LangGraph Collaborative Pipeline."
        else:
            return (
                "You are an industrial AI assistant. You must answer the User Query using ONLY the provided Context. "
                "Do NOT just repeat the context verbatim. If the Context does not contain the specific answer to the User Query, "
                "you MUST respond exactly with: \"The retrieved document chunks do not contain the specific information required to answer this query.\" "
                "Do not invent an answer."
            )

    def get_hardware_info(self) -> Dict[str, Any]:
        return {
            "target": self.config.get("hardware_target", "RTX 2050 (4GB VRAM)"),
            "max_vram": self.config.get("max_vram_gb", 4.0),
            "configured_models": list(self.config.get("models", {}).keys())
        }


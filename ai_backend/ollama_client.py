import httpx
import json
import logging
from typing import AsyncGenerator, Dict, Any, Optional, List

logger = logging.getLogger("sovereign_workbench.ollama_client")

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url.rstrip("/")
        self.client = httpx.AsyncClient(timeout=120.0)

    async def check_health(self) -> bool:
        """Check if local Ollama service is reachable."""
        try:
            res = await self.client.get(f"{self.base_url}/api/tags")
            return res.status_code == 200
        except Exception:
            return False

    async def list_available_models(self) -> list[str]:
        """List currently downloaded models in Ollama."""
        try:
            res = await self.client.get(f"{self.base_url}/api/tags")
            if res.status_code == 200:
                data = res.json()
                return [m["name"] for m in data.get("models", [])]
        except Exception as e:
            logger.warning(f"Could not reach Ollama: {e}")
        return []

    async def generate_response(
        self,
        model: str,
        prompt: str,
        system_prompt: Optional[str] = None,
        images: Optional[List[str]] = None,
        fallback_model: Optional[str] = None,
        keep_alive: Optional[int] = None,
        history_messages: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        messages: List[Dict[str, Any]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        if history_messages:
            for msg in history_messages:
                messages.append({"role": msg["role"], "content": msg["content"]})

        user_message: Dict[str, Any] = {"role": "user", "content": prompt}
        if images and isinstance(images, list):
            cleaned_images = []
            for img in images:
                if img.startswith("data:"):
                    img = img.split(",", 1)[1]
                cleaned_images.append(img)
            user_message["images"] = cleaned_images
        messages.append(user_message)

        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {"num_ctx": 2048, "temperature": 0.2}
        }
        if keep_alive is not None:
            payload["keep_alive"] = keep_alive

        try:
            res = await self.client.post(f"{self.base_url}/api/chat", json=payload)
            if res.status_code == 200:
                data = res.json()
                return {
                    "success": True,
                    "model_used": model,
                    "response": data.get("message", {}).get("content", ""),
                    "simulated": False
                }
            else:
                logger.warning(f"Ollama {model} failed with status {res.status_code}: {res.text}")
                if fallback_model:
                    payload["model"] = fallback_model
                    res_fb = await self.client.post(f"{self.base_url}/api/chat", json=payload)
                    if res_fb.status_code == 200:
                        data = res_fb.json()
                        return {
                            "success": True,
                            "model_used": fallback_model,
                            "response": data.get("message", {}).get("content", ""),
                            "simulated": False
                        }
        except Exception as e:
            logger.warning(f"Ollama connection error for model {model}: {e}")

        return {
            "success": False,
            "model_used": model,
            "response": f"[SIMULATED - {model}] Processing complete.",
            "simulated": True
        }

    async def close(self):
        await self.client.aclose()



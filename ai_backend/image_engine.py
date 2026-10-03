"""
backend/image_engine.py
========================
Local Air-Gapped Image Generation Engine
Powered by Stable Diffusion v1.5 via HuggingFace diffusers.

VRAM Optimisation Strategy (RTX 2050 — 4 GB ceiling):
  • torch.float16          → halves model footprint (~2.0 GB vs ~4.0 GB fp32)
  • enable_attention_slicing() → slices attention computation, reduces peak VRAM
  • enable_vae_slicing()   → decodes latents one frame at a time (critical for 4GB)
  • enable_model_cpu_offload() → fallback: offloads non-active sub-models to RAM
  • num_inference_steps=25 → balanced quality / speed for RTX 2050 (~15-25s)
  • guidance_scale=7.5     → standard CFG — lower values reduce memory pressure
"""

import os
import logging
import threading
from datetime import datetime
from typing import Optional

logger = logging.getLogger("sovereign_workbench.image_engine")

# ── Graceful import guards ────────────────────────────────────────────────────
try:
    import torch
    TORCH_AVAILABLE = True
    CUDA_AVAILABLE = torch.cuda.is_available()
except ImportError:
    TORCH_AVAILABLE = False
    CUDA_AVAILABLE = False
    logger.warning("torch not installed — image generation will be unavailable.")

try:
    from diffusers import StableDiffusionPipeline
    DIFFUSERS_AVAILABLE = True
except ImportError:
    DIFFUSERS_AVAILABLE = False
    logger.warning("diffusers not installed — image generation will be unavailable.")


# ── Model Identifier ──────────────────────────────────────────────────────────
SD_MODEL_ID = "runwayml/stable-diffusion-v1-5"


class LocalImageGenerator:
    """
    Air-gapped Stable Diffusion image generator optimised for 4 GB VRAM.

    The pipeline is loaded LAZILY — it is NOT instantiated at import time so
    it does not consume VRAM during text-only RAG sessions.  The first call to
    generate_image() triggers the one-time model load.  Subsequent calls reuse
    the already-loaded pipeline (no reload penalty).

    Thread-safety: a threading.Lock prevents concurrent load/generate races.
    """

    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self._pipe = None          # lazy — None until first generate_image() call
        self._lock = threading.Lock()
        self._loaded = False
        self._load_error: Optional[str] = None

    # ── Internal: load pipeline once ─────────────────────────────────────────
    def _load_pipeline(self) -> None:
        """Loads the SD pipeline with all 4 GB VRAM optimisations. Called once."""
        if not TORCH_AVAILABLE or not DIFFUSERS_AVAILABLE:
            raise RuntimeError(
                "torch and diffusers must be installed. "
                "Run: pip install torch diffusers transformers accelerate"
            )

        if not CUDA_AVAILABLE:
            logger.warning(
                "CUDA not available — falling back to CPU inference (very slow, ~3-5 min/image). "
                "For production use, ensure CUDA 11.8+ and the correct torch+cu118 wheel are installed."
            )

        logger.info(f"Loading Stable Diffusion pipeline: {SD_MODEL_ID} ...")

        dtype = torch.float16 if CUDA_AVAILABLE else torch.float32

        pipe = StableDiffusionPipeline.from_pretrained(
            SD_MODEL_ID,
            torch_dtype=dtype,
            safety_checker=None,        # disable NSFW filter to avoid extra VRAM for the safety model
            requires_safety_checker=False
        )

        if CUDA_AVAILABLE:
            pipe = pipe.to("cuda")
            # ── VRAM Optimisations ──────────────────────────────────────────
            pipe.enable_attention_slicing()    # slices QKV attention — critical on 4 GB
            pipe.enable_vae_slicing()          # decode latents one slice at a time

            # Optional: xformers memory-efficient attention (requires xformers installed)
            try:
                pipe.enable_xformers_memory_efficient_attention()
                logger.info("xformers memory-efficient attention enabled.")
            except Exception:
                logger.info("xformers not available — using standard attention slicing.")
        else:
            # CPU fallback — enable_model_cpu_offload requires accelerate and CUDA,
            # so on pure CPU we just leave the model on CPU as-is.
            logger.warning("Running on CPU — generation will be slow.")

        self._pipe = pipe
        self._loaded = True
        logger.info("Stable Diffusion pipeline loaded and VRAM-optimised successfully.")

    # ── Public API ────────────────────────────────────────────────────────────
    def generate_image(
        self,
        prompt: str,
        negative_prompt: str = (
            "blurry, low quality, distorted, watermark, text, nsfw, "
            "poorly drawn, bad anatomy, extra limbs, duplicate"
        ),
        num_inference_steps: int = 25,
        guidance_scale: float = 7.5,
        width: int = 512,
        height: int = 512,
        seed: Optional[int] = None
    ) -> str:
        """
        Generates an image from the given text prompt.

        Args:
            prompt:              Text description of the desired image.
            negative_prompt:     Things to avoid in the image.
            num_inference_steps: Denoising steps (25 is balanced for 4 GB VRAM).
            guidance_scale:      CFG scale — higher = closer to prompt, more VRAM.
            width / height:      Output resolution — 512×512 is mandatory for SD v1.5
                                 on 4 GB VRAM. Going above 640 will OOM.
            seed:                Optional deterministic seed for reproducibility.

        Returns:
            Filename (basename only) of the saved PNG inside output_dir.

        Raises:
            RuntimeError: if the pipeline cannot be loaded.
        """
        with self._lock:
            if not self._loaded:
                if self._load_error:
                    raise RuntimeError(f"Pipeline failed to load previously: {self._load_error}")
                try:
                    self._load_pipeline()
                except Exception as e:
                    self._load_error = str(e)
                    raise RuntimeError(f"Failed to load Stable Diffusion pipeline: {e}") from e

        logger.info(f"[ImageGen] Generating image — prompt: '{prompt[:80]}...' steps={num_inference_steps}")

        # ── Generator for reproducibility ────────────────────────────────────
        generator = None
        if seed is not None and TORCH_AVAILABLE and CUDA_AVAILABLE:
            generator = torch.Generator("cuda").manual_seed(seed)
        elif seed is not None and TORCH_AVAILABLE:
            generator = torch.Generator("cpu").manual_seed(seed)

        # ── Inference ────────────────────────────────────────────────────────
        with self._lock:
            result = self._pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                width=width,
                height=height,
                generator=generator
            )

        image = result.images[0]

        # ── Save to output_dir ───────────────────────────────────────────────
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"SovereignX_GenImage_{timestamp}.png"
        filepath = os.path.join(self.output_dir, filename)
        image.save(filepath, format="PNG")

        logger.info(f"[ImageGen] Image saved: {filename}  ({width}×{height}px)")
        return filename

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def is_cuda(self) -> bool:
        return CUDA_AVAILABLE

    @property
    def is_available(self) -> bool:
        return TORCH_AVAILABLE and DIFFUSERS_AVAILABLE

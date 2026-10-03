import asyncio
import time
from ollama_client import OllamaClient

async def test():
    c = OllamaClient()
    start = time.time()
    print("Sending request...")
    res = await c.generate_response(
        'qwen2.5-coder:3b',
        'Write a very complex and long python script for a web server. At least 100 lines.',
        system_prompt='You are a senior python developer.'
    )
    print(f"Done in {time.time() - start:.2f}s")
    print("Success:", res['success'])

asyncio.run(test())

file_path = r'C:\sovereignX\ai_backend\main.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# 1. replace assignment
content = content.replace(
'''        if req.simulate_low_vram:
            target_model = "qwen2.5-coder:1.5b-q4_0"
            vram_req = 1.5''',
'''        display_model = target_model
        if req.simulate_low_vram:
            display_model = "qwen2.5-coder:1.5b-q4_0"
            vram_req = 1.5'''
)

# 2. replace target_model with display_model in the frontend JSONs
content = content.replace(
'''                f"Category: [{intent_category.upper()}] | Model: {target_model} | "''',
'''                f"Category: [{intent_category.upper()}] | Model: {display_model} | "'''
)

content = content.replace(
'''            "title": f"Routing to Local Model [{target_model}]",''',
'''            "title": f"Routing to Local Model [{display_model}]",'''
)

content = content.replace(
'''            "details": f"Model inference successful ({target_model}) under air-gapped environment."''',
'''            "details": f"Model inference successful ({display_model}) under air-gapped environment."'''
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

file_path = r'C:\sovereignX\ai_backend\main.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''"model_used": ollama_res["model_used"],''',
'''"model_used": display_model,'''
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

file_path = r'C:\sovereignX\ai_backend\main.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Add FaceAuthRequest
new_model = """class FaceAuthRequest(BaseModel):
    image_base64: str

"""

content = content.replace('class ApprovalRequest(BaseModel):', new_model + 'class ApprovalRequest(BaseModel):')

# Add endpoint
new_endpoint = """@app.post("/api/v1/auth/verify-face")
async def verify_face(req: FaceAuthRequest):
    try:
        import cv2
        import numpy as np
        import base64

        encoded_data = req.image_base64
        if "base64," in encoded_data:
            encoded_data = encoded_data.split("base64,")[1]
            
        img_data = base64.b64decode(encoded_data)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image payload")
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(60, 60))
        
        face_count = len(faces)
        approved = face_count > 0
        
        return {
            "approved": approved,
            "face_count": face_count,
            "status": "OPERATOR_PRESENT" if approved else "AWAITING_OPERATOR"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""

content = content.replace('@app.post("/api/v1/approve-execution")', new_endpoint + '@app.post("/api/v1/approve-execution")')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

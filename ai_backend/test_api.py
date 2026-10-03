import base64
import requests
import cv2
import sys

img_path = r"C:\Users\Sukhendu chakraborty\.gemini\antigravity\brain\1bd9e590-7fe9-43bf-9a27-a2e538e49af6\.user_uploaded\media_1791014615217.png"
img = cv2.imread(img_path)

h, w, _ = img.shape
cy, cx = h//2, w//2
video_crop = img[cy-240:cy+240, cx-320:cx+320]
resized = cv2.resize(video_crop, (320, 240))

_, buffer = cv2.imencode('.jpg', resized)
b64 = base64.b64encode(buffer).decode('utf-8')

payload = {"image_base64": f"data:image/jpeg;base64,{b64}"}

try:
    res = requests.post("http://localhost:8000/api/v1/auth/verify-face", json=payload)
    print("Status:", res.status_code)
    print("Response:", res.text)
except Exception as e:
    print("Error:", e)

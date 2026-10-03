import cv2
import sys

img_path = r"C:\Users\Sukhendu chakraborty\.gemini\antigravity\brain\1bd9e590-7fe9-43bf-9a27-a2e538e49af6\.user_uploaded\media_1791014615217.png"
img = cv2.imread(img_path)
if img is None:
    print("Failed to load image")
    sys.exit(1)

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

for scaleFactor in [1.1, 1.2, 1.3]:
    for minNeighbors in [3, 4, 5]:
        faces = face_cascade.detectMultiScale(gray, scaleFactor=scaleFactor, minNeighbors=minNeighbors, minSize=(30, 30))
        print(f"scaleFactor={scaleFactor}, minNeighbors={minNeighbors}, minSize=30x30 -> faces={len(faces)}")
        faces2 = face_cascade.detectMultiScale(gray, scaleFactor=scaleFactor, minNeighbors=minNeighbors, minSize=(60, 60))
        print(f"scaleFactor={scaleFactor}, minNeighbors={minNeighbors}, minSize=60x60 -> faces={len(faces2)}")

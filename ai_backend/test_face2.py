import cv2
import sys

img_path = r"C:\Users\Sukhendu chakraborty\.gemini\antigravity\brain\1bd9e590-7fe9-43bf-9a27-a2e538e49af6\.user_uploaded\media_1791014615217.png"
img = cv2.imread(img_path)
if img is None:
    print("Failed to load image")
    sys.exit(1)

# In the screenshot, the video player is in the middle of the screen.
# Let's crop to roughly the video player area first, as the user's face is there.
# It seems the video is about 500x300 in the center of the 1920x1080 screen.
# Actually, the user uploaded a screenshot of their entire screen.
# The face is inside the video element which is just a part of the screen.
# Let's just resize the cropped video area to 320x240 as the frontend does.
# To simulate the frontend, let's extract a rough crop of the video area.
# Let's just manually guess the bounding box for the video from the image.
# Assuming 1920x1080, video is roughly 640x480 in the center.
h, w, _ = img.shape
cy, cx = h//2, w//2
video_crop = img[cy-240:cy+240, cx-320:cx+320]

resized = cv2.resize(video_crop, (320, 240))
gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(60, 60))
print(f"minSize=60x60 -> faces={len(faces)}")

faces_small = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=5, minSize=(30, 30))
print(f"minSize=30x30 -> faces={len(faces_small)}")


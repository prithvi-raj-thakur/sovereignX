import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True, 
    max_num_faces=1, 
    refine_landmarks=False, 
    min_detection_confidence=0.7
)

img_path = r"C:\Users\Sukhendu chakraborty\.gemini\antigravity\brain\1bd9e590-7fe9-43bf-9a27-a2e538e49af6\.user_uploaded\media_1791014615217.png"
img = cv2.imread(img_path)
h, w, _ = img.shape
cy, cx = h//2, w//2
video_crop = img[cy-240:cy+240, cx-320:cx+320]
resized = cv2.resize(video_crop, (320, 240))
rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

res = face_mesh.process(rgb)
if res.multi_face_landmarks:
    print("Human face detected by FaceMesh:", len(res.multi_face_landmarks))
else:
    print("No human face detected.")

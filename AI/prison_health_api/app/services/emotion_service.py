from ultralytics import YOLO
import cv2
import collections

# Load your custom trained YOLO model for emotion detection
# Ensure 'best_emotion_yolo.pt' exists in your project
try:
    model = YOLO("app/models/best.pt") 
    print("YOLO model loaded successfully.")
except:
    print("Warning: YOLO model not found. Using placeholder.")
    model = None

def analyze_video_emotions(video_path):
    """
    Analyzes a 3-second video clip and returns the most frequent emotion.
    """
    if not model:
        return "Unknown", 0.0

    cap = cv2.VideoCapture(video_path)
    emotions_list = []
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Run inference
        results = model(frame, verbose=False)
        
        for result in results:
            # Assuming class names map to emotions: 0:Happy, 1:Sad, 2:Angry, etc.
            # You must adapt this based on your specific training
            for box in result.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                emotion_name = model.names[cls_id]
                emotions_list.append((emotion_name, conf))

    cap.release()

    if not emotions_list:
        return "Neutral", 0.0

    # Get most common emotion
    emotion_counts = collections.Counter([e[0] for e in emotions_list])
    dominant_emotion = emotion_counts.most_common(1)[0][0]
    
    # Average confidence for that emotion
    avg_conf = sum([e[1] for e in emotions_list if e[0] == dominant_emotion]) / emotion_counts[dominant_emotion]
    
    return dominant_emotion, avg_conf
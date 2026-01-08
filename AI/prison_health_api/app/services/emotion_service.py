from ultralytics import YOLO
import cv2
import collections

# 1. Define the Mapping
EMOTION_MAP = {
    'angry': 'anger',
    'anger': 'anger',
    'disgust': 'disgust',
    'fear': 'fear',
    'happy': 'happiness',
    'happiness': 'happiness',
    'neutral': 'neutral',
    'sad': 'sadness',
    'sadness': 'sadness',
    'surprise': 'surprise'
}

# Load Model
try:
    model = YOLO("app/models/best.pt") 
    print("YOLO model loaded successfully.")
    print(f"Model recognizes classes: {model.names}") 
except Exception as e:
    print(f"Warning: YOLO model not found. Using placeholder. Error: {e}")
    model = None

def analyze_video_emotions(video_path):
    """
    Analyzes a video clip using YOLO Classification or Detection.
    """
    if not model:
        return "neutral", 0.0

    cap = cv2.VideoCapture(video_path)
    emotions_list = []
    
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Process every 5th frame to speed up (optional but recommended)
        frame_count += 1            
        # Run inference
        results = model(frame, verbose=False)
        
        for result in results:
            # --- CASE A: CLASSIFICATION MODEL (Your Case) ---
            if hasattr(result, 'probs') and result.probs is not None:
                # Get the class with the highest probability
                class_id = result.probs.top1
                conf = result.probs.top1conf.item() # Convert tensor to float
                raw_label = model.names[class_id].lower()
                
                # Map and store
                mapped_emotion = EMOTION_MAP.get(raw_label, 'neutral')
                print(f"Detected emotion: {mapped_emotion} with confidence {conf}")
                emotions_list.append((mapped_emotion, conf))
    cap.release()

    if not emotions_list:
        return "neutral", 0.0

    # Get most common emotion
    emotion_counts = collections.Counter([e[0] for e in emotions_list])
    if not emotion_counts:
        return "neutral", 0.0
        
    dominant_emotion = emotion_counts.most_common(1)[0][0]
    
    # Calculate average confidence
    total_conf = sum([e[1] for e in emotions_list if e[0] == dominant_emotion])
    count = emotion_counts[dominant_emotion]
    avg_conf = total_conf / count if count > 0 else 0.0
    
    return dominant_emotion, avg_conf
# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV and audio processing
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
# Add librosa since it was manually installed but not in requirements
RUN pip install --no-cache-dir librosa

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 5010

# Command to run the application
CMD ["python", "run.py"]

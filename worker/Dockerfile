# Worker Dockerfile for NuuMee video processing
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8080

WORKDIR /app

# Install FFmpeg for inline watermarking (free tier)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy shared module (must be copied by deploy script before build)
# The shared/ directory should be copied to worker/shared/ before docker build
COPY shared/ ./shared/

# Run with gunicorn for production (timeout=2400 for long video processing)
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 2400 main:app

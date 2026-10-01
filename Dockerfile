# EcoFlow AI - Cloud Production Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Ensure unbuffered python output
ENV PYTHONUNBUFFERED=1
ENV PORT=8088

# Copy application files
COPY . /app

# Expose port
EXPOSE 8088

# Run server
CMD ["python", "server.py"]

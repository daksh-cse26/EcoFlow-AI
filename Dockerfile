# EcoFlow AI - Cloud Production Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Ensure unbuffered python output and UTF-8
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PORT=10000

# Copy application files
COPY . /app

# Ensure full read/write permissions for SQLite database operations
RUN chmod -R 777 /app

# Expose Render standard port
EXPOSE 10000

# Run server with unbuffered output
CMD ["python", "-u", "server.py"]

# EcoFlow AI - Cloud Production Dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PORT=10000

# Copy application files
COPY . /app

# Ensure permissions
RUN chmod +x /app/server.py && chmod -R 777 /app

EXPOSE 10000

CMD ["python3", "-u", "/app/server.py"]

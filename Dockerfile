# EcoFlow AI - Cloud Production Dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PORT=10000
ENV WEB_CONCURRENCY=1

# Copy application files
COPY . /app

# Fix any CRLF line endings, ensure executable permissions, and open database write access
RUN sed -i 's/\r$//' /app/entrypoint.sh /app/server.py && \
    chmod +x /app/entrypoint.sh /app/server.py && \
    chmod -R 777 /app

EXPOSE 10000

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]

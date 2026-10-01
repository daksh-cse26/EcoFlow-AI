# EcoFlow AI - Cloud Production Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Ensure unbuffered python output, UTF-8, and complete PATH
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PORT=10000
ENV PATH="/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/bin:/sbin:$PATH"

# Ensure python & python3 symlinks exist across all standard PATH locations
RUN ln -sf /usr/local/bin/python3 /usr/bin/python && \
    ln -sf /usr/local/bin/python3 /usr/bin/python3

# Copy application files into /app
COPY . /app

# Set write permissions for SQLite DB and executable permissions
RUN chmod +x /app/server.py && chmod -R 777 /app

# Expose Render standard port
EXPOSE 10000

# Explicit shell launcher with startup diagnostics
CMD ["sh", "-c", "echo '==> EcoFlow AI Container Process Starting...' && python3 -u /app/server.py ${PORT:-10000}"]

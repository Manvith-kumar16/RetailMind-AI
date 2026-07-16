# Stage 1: Build the runtime environment
FROM python:3.11-slim-bookworm as build
WORKDIR /app

COPY requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir gunicorn uvicorn && pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# Stage 2: Final Production Image
FROM python:3.11-slim-bookworm as final
WORKDIR /app

# Copy installed packages from build stage
COPY --from=build /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=build /usr/local/bin /usr/local/bin

# Copy the application code
COPY . .

# Expose the port
EXPOSE 8001

# Run the FastAPI application with Gunicorn and Uvicorn workers
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8001"]

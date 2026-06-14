FROM python:3.11-slim

WORKDIR /app

# Install dependencies required for scipy/pandas
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY python_api/requirements.txt python_api/requirements.txt
RUN pip install --no-cache-dir -r python_api/requirements.txt

COPY python_api/ python_api/
COPY models/ models/
COPY datasets/ datasets/

WORKDIR /app/python_api

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]

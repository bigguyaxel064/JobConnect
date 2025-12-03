#Again like the front, it's less heavy, if we encounter some problem, we can use bullseye instead of slim
FROM python:3.11-slim

WORKDIR /app

# updated package needed before apt-get install
#The gcc is a "compiler C", needed if some extension needd to be compile
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . /app

EXPOSE 5000

CMD ["python", "server.py"]

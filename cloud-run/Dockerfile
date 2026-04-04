FROM python:3.11-slim

WORKDIR /app

# Instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY main.py .

# Cloud Run usa a variável PORT
ENV PORT=8080

# Executar
CMD ["python", "main.py"]

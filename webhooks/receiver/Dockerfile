FROM python:3.12-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY webhooks/receiver/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY webhooks/ /app/webhooks/
COPY integrations/ /app/integrations/

EXPOSE 4000

CMD ["python", "webhooks/receiver/server.py"]

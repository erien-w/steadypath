FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set permissions for the start script
RUN chmod +x start.sh

# Expose ports
EXPOSE 5005
EXPOSE 5055

# Default environment variables
ENV PORT=5005
ENV PORT_ACTIONS=5055

# Start the application
CMD ["./start.sh"]

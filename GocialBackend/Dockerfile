# ==============================================================================
# Gocial Backend Dockerfile
# 
# Multi-stage build for smaller production images
# ==============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base image with Python
# -----------------------------------------------------------------------------
FROM python:3.11-slim AS base

# Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*


# -----------------------------------------------------------------------------
# Stage 2: Builder - install Python dependencies
# -----------------------------------------------------------------------------
FROM base AS builder

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt


# -----------------------------------------------------------------------------
# Stage 3: Development image
# -----------------------------------------------------------------------------
FROM base AS development

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dev dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir pytest pytest-cov factory-boy

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash gocial \
    && chown -R gocial:gocial /app
USER gocial

EXPOSE 5000

# Default command for development
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--debug"]


# -----------------------------------------------------------------------------
# Stage 4: Production image
# -----------------------------------------------------------------------------
FROM base AS production

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install gunicorn for production
RUN pip install --no-cache-dir gunicorn

# Copy only what's needed for production
COPY app app/
COPY migrations migrations/
COPY config.py .
COPY run.py .

# Create non-root user
RUN useradd --create-home --shell /bin/bash gocial \
    && chown -R gocial:gocial /app
USER gocial

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 5000

# Environment variables for production
ENV FLASK_ENV=production
ENV FLASK_DEBUG=False

# Production server with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "run:app"]

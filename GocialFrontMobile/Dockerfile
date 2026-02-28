# ==============================================================================
# Gocial Frontend - Node.js development environment
#
# Note: React Native apps run on physical devices / emulators, not in Docker.
# This Dockerfile is for CI tasks: lint, type-check, test, dependency install.
# ==============================================================================

FROM node:20-alpine AS base

WORKDIR /app

# Install system deps for native modules
RUN apk add --no-cache git python3 make g++

# Copy package files first (Docker layer cache)
COPY package.json yarn.lock* package-lock.json* ./

# Install dependencies
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copy source
COPY . .

# Default: type-check
CMD ["npx", "tsc", "--noEmit"]

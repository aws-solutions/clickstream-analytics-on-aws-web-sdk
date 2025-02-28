#!/usr/bin/env bash

# sh ./deployment/run-unit-tests.sh

set -euxo pipefail

log() {
    echo -e "[INFO] $1"
}

error() {
    echo -e "[ERROR] $1"
    exit 1
}

# Install dependencies
log "Installing dependencies..."
npm i || error "Failed to install dependencies"


# Run prettier format
log "Running prettier..."
npm run format || error "Prettier failed."

# Run linting
log "Running linter..."
npm run lint || error "Linting failed."

# Run tests
log "Running tests..."
npm run test || error "Tests failed"

log "All tests passed!"

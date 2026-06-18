#!/bin/bash
set -e
echo "Installing Python dependencies..."
pip install -q -r backend/requirements.txt
echo "Building React frontend..."
pnpm --filter @workspace/ai-tutor run build
echo "Build complete."

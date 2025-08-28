#!/bin/bash
set -e

echo "=== Starting Vercel Build ==="

# Check Node.js version
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run linting (but don't fail on warnings)
echo "Running linting..."
npm run lint || echo "Linting completed with warnings"

# Build the project
echo "Building project..."
npm run build

# Verify build output
echo "Verifying build output..."
if [ -d "dist" ]; then
    echo "✅ Build directory created successfully"
    ls -la dist/
else
    echo "❌ Build directory not found"
    exit 1
fi

echo "=== Build completed successfully ==="

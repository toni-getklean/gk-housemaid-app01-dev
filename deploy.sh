#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Clean up
echo "🧹 Cleaning up..."
rm -rf .next
rm -rf node_modules
rm -f package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type checking
echo "🔍 Running type check..."
npm run type-check

npm run build

echo "✅ Build completed successfully!" 
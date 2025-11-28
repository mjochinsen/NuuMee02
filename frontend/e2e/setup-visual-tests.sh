#!/bin/bash

# Visual Regression Test Setup Script for NuuMee
# This script installs Playwright and generates initial baseline snapshots

set -e

echo "🎭 Setting up Playwright Visual Regression Tests"
echo "================================================"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the frontend directory"
  exit 1
fi

# Install Playwright browsers
echo "📦 Installing Playwright browsers..."
npx playwright install chromium

# Install system dependencies (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  echo "🐧 Installing system dependencies for Linux..."
  npx playwright install-deps chromium
fi

echo ""
echo "✅ Playwright setup complete!"
echo ""
echo "📸 Generating baseline snapshots..."
echo "   This will start the dev server and capture screenshots of all pages"
echo ""

# Generate baseline snapshots
npx playwright test --grep "@visual" --update-snapshots || {
  echo ""
  echo "⚠️  Warning: Some snapshots failed to generate"
  echo "   This is normal if the dev server isn't running"
  echo ""
  echo "To generate snapshots manually:"
  echo "  1. Start dev server: pnpm dev"
  echo "  2. Run: npx playwright test --grep @visual --update-snapshots"
  exit 0
}

echo ""
echo "✨ Setup complete! Visual regression tests are ready."
echo ""
echo "📚 Quick Start:"
echo "  • Run all visual tests: npx playwright test --grep @visual"
echo "  • Run with UI: npx playwright test --grep @visual --ui"
echo "  • Update snapshots: npx playwright test --grep @visual --update-snapshots"
echo ""
echo "📖 See e2e/README.md for full documentation"

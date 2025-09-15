#!/bin/bash

# TollCalc Local Deployment Test Script
# This script simulates the GitHub Actions deployment process locally

echo "🚀 TollCalc Deployment Test"
echo "=========================="

cd ..
# Clean up any existing test deployment
if [ -d "test_deploy" ]; then
    rm -rf test_deploy
    echo "✅ Cleaned up existing test deployment"
fi

# Create deployment directory
mkdir -p test_deploy
echo "✅ Created deployment directory"

# Copy files (same as GitHub Actions workflow)
echo "📂 Copying files..."
cp index.html test_deploy/ && echo "  ✓ index.html"
cp CNAME test_deploy/ && echo "  ✓ CNAME" 
cp styles.css test_deploy/ && echo "  ✓ styles.css"

# Copy directories that exist
if cp -r assets/ test_deploy/ 2>/dev/null; then
    echo "  ✓ assets/"
else
    echo "  ⚠ assets/ not found (optional)"
fi

if cp -r js/ test_deploy/ 2>/dev/null; then
    echo "  ✓ js/"
else
    echo "  ⚠ js/ not found (optional)"
fi

if cp -r data/ test_deploy/ 2>/dev/null; then
    echo "  ✓ data/"
else
    echo "  ⚠ data/ not found (optional)"
fi

# Create .nojekyll for GitHub Pages
touch test_deploy/.nojekyll
echo "  ✓ .nojekyll"

echo ""
echo "📊 Deployment Summary:"
echo "====================="
du -sh test_deploy/
echo ""
ls -la test_deploy/
echo ""

echo "✨ Test deployment complete!"
echo "📁 Files are in ./test_deploy/"
echo ""
echo "Serving locally..."
npx serve ./test_deploy
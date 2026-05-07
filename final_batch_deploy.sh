#!/bin/bash

# Configuration
TARGET_DIR="public_html"
BATCH_SIZE=10
TMP_DEPLOY_DIR="final_deploy"

# 1. Clean and prepare deploy directory
echo "=== Preparing Final Deployment Directory ==="
rm -rf "$TMP_DEPLOY_DIR"
mkdir -p "$TMP_DEPLOY_DIR/assets"

# 2. Copy core files
cp "$TARGET_DIR"/*.html "$TMP_DEPLOY_DIR/" 2>/dev/null
cp "$TARGET_DIR"/*.js "$TMP_DEPLOY_DIR/" 2>/dev/null
cp "$TARGET_DIR"/*.css "$TMP_DEPLOY_DIR/" 2>/dev/null

# 3. Get all assets (excluding MP4s)
# Note: This time we INCLUDE .glb files!
cd "$TARGET_DIR/assets"
FILES=$(find . -maxdepth 1 -type f -not -name "*.mp4" | sed 's|^\./||')
cd ../..

echo "=== Total files to process: $(echo "$FILES" | wc -l) ==="

# 4. Batch Deploy
count=0
batch_count=0

for file in $FILES; do
    cp "$TARGET_DIR/assets/$file" "$TMP_DEPLOY_DIR/assets/"
    count=$((count + 1))
    
    if [ $((count % BATCH_SIZE)) -eq 0 ]; then
        batch_count=$((batch_count + 1))
        echo "=== Deploying batch $batch_count at file $count: $file ==="
        
        # Point firebase.json to the tmp deploy dir temporarily
        sed -i 's/"public": ".*"/"public": "'"$TMP_DEPLOY_DIR"'"/' firebase.json
        
        firebase deploy --only hosting
        
        if [ $? -ne 0 ]; then
            echo "Deployment failed at batch $batch_count"
            exit 1
        fi
    fi
done

# Final deployment for remaining files
echo "=== Finalizing Deployment ==="
sed -i 's/"public": ".*"/"public": "'"$TMP_DEPLOY_DIR"'"/' firebase.json
firebase deploy --only hosting

# Restore original firebase config
sed -i 's/"public": ".*"/"public": "public_html"/' firebase.json

echo "=== PLATFORM FULLY RESTORED AND DEPLOYED ==="

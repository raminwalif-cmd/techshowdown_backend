#!/bin/bash
# TechShowdown 2026 - Server Recovery Script

echo "Stopping any existing servers on Port 3000..."
fuser -k 3000/tcp || true

echo "Starting Neural Price Engine on Port 3000..."
nohup node server.js > server.log 2>&1 &

echo "------------------------------------------------"
echo " SERVER IS NOW LIVE AT: http://localhost:3000   "
echo "------------------------------------------------"
echo "Logs are being written to server.log"

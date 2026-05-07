#!/bin/bash
FILES=$(ls core_deploy/assets)
COUNT=0
BATCH_SIZE=10
for f in $FILES; do
  # We already have some files in the root of core_deploy/assets,
  # but firebase deploy only uploads what's new/changed.
  # However, the CLI seems to hang if too many new files are detected.
  # So we will try to deploy 10 files at a time.
  ((COUNT++))
  if (( COUNT % BATCH_SIZE == 0 )); then
    echo "Deploying batch at file $COUNT: $f"
    cd core_deploy && firebase deploy --only hosting --project techshowdown-6e51b --non-interactive
    cd ..
  fi
done
# Final deploy for any leftovers
cd core_deploy && firebase deploy --only hosting --project techshowdown-6e51b --non-interactive

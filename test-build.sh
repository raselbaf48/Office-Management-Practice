#!/bin/bash
if pgrep -f "npm run build" > /dev/null; then
  echo "Build is still running"
else
  echo "Build finished"
fi

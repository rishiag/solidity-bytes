#!/usr/bin/env bash
set -euo pipefail

IMAGE_TAG="soliditybytes-runner:local"

docker build -t "$IMAGE_TAG" -f docker/runner/Dockerfile .

# Run with read-only FS and limited resources
docker run --rm \
  --cpus=1 --memory=1g \
  --read-only -v "$(pwd)":/workspace:ro \
  -w /app \
  "$IMAGE_TAG" "$@"


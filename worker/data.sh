#!/bin/bash

IMAGE=artema/facial-recognition-worker
VERSION=latest

# Uncomment to build from the source
# docker build --platform linux/amd64 -t $IMAGE:$VERSION .

docker run --platform linux/amd64 --rm -t -v "$(pwd)/data":/usr/src/app/data $IMAGE:$VERSION python3 -u data.py

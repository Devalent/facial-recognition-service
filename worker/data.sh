#!/bin/bash

docker build -t facial-recognition-worker:data .
docker run --rm facial-recognition-worker:data -v "./data:/usr/src/app/data" "python -u data.py"

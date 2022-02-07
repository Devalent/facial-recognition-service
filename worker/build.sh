#!/bin/bash

NAME=artema/facial-recognition-worker
VERSION=latest

docker build --platform linux/amd64 -t $NAME:$VERSION .
docker push $NAME:$VERSION

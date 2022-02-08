# Facial recognition web service example

An example implementation of a real-time facial recognition server that processes WebRTC streams from web browsers to detect and to encode faces. See [this blog post](https://devalent.com/blog/how-to-build-a-real-time-facial-recognition-service/) of an in-depth explanation.

## Demo :rocket:

A [demo application](https://devalent.github.io/facial-recognition-app/) is available online. It doesn't have a backend and runs on a pre-built data made from the Labeled Faces in the Wild dataset ("people with name starting with A" subset), which has been processed by the same algorithm that is used if you run the backend yourself.

## Usage

* `docker-compose up --force-recreate --abort-on-container-exit`;
* Wait for an "Application is running!" message;
* Allow invalid certificates for resources loaded from localhost (see `chrome://flags/#allow-insecure-localhost`);
* Navigate to [localhost:3000](http://localhost:3000).

## Project structure

* `app/` - a Next.js client application and a backend that communicates with the worker and the WebRTC server;
* `worker/` - a stateless Python server that implements a facial recognition algorithm.

WebRTC server is based on [OpenVidu](https://openvidu.io/).

## Use a custom dataset

It is possible to run the demo application without a backend and with a custom pre-built image set. In order to do that, place your `.jpg` images to `worker/data` and run `data.sh` from the worker directory. Processed data will be saved to a JSON file that you need to copy to `app/data.json`. Web application started with `STANDALONE=1` environment variable will use that JSON file instead of processing webcam data on the backend.

## Credits

* [Face recognition library](https://github.com/ageitgey/face_recognition) by Adam Geitgey;
* [Labeled Faces in the Wild dataset](http://vis-www.cs.umass.edu/lfw/) used in the demo application;
* [Bootstrap theme](https://startbootstrap.com/template/shop-item) by Start Bootstrap;
* [Test card image](https://commons.wikimedia.org/wiki/File:Philips_PM5544.svg) by Ebnz.
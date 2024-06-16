# Installation
Install [docker desktop](https://www.docker.com/products/docker-desktop/) from official website
# Building Image
To build docker image, go to project directory and run:
```
docker build -t ai-sales .
```
this will build an image from `Dockerfile`. You will be able to see this image in your docker desktop app in `images` section
# Running
To start the webapp, run:
```
docker run -p 8000:8000 --name ai-sales ai-sales
```
in project directory. You will see the running container in docker desktop in `containers` section

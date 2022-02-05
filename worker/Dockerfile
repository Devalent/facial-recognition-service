FROM python:3.6

EXPOSE 3000

RUN apt-get update -y \
    && apt-get install -y cmake

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . /usr/src/app

CMD [ "python", "-u", "main.py" ]

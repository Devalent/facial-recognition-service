FROM node:14

EXPOSE 3000

RUN apt-get update -y \
    && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

ADD package.json .
ADD package-lock.json .

RUN npm ci
RUN npx next telemetry disable

ADD . .

RUN npm run build

CMD /wait && echo "Application is running!" && npm start

FROM node:14

EXPOSE 3000

RUN apt-get update -y \
    && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

ADD package.json .
ADD package-lock.json .

RUN npm ci
RUN npx next telemetry disable

ADD . .

RUN npm run build

CMD npm start

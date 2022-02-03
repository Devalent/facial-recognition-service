FROM node:16

EXPOSE 3000

ADD . .

RUN npm ci
RUN npx next telemetry disable
RUN npm run build

CMD npm start

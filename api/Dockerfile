FROM node:lts-alpine
MAINTAINER r.wetzelt@yahoo.de
WORKDIR /dist/ArduinoObstgarten/api
COPY ./Server/libredis.js /dist/ArduinoObstgarten/frontend/Server/
COPY ./*.json ./*.js /dist/ArduinoObstgarten/api/

RUN npm install

EXPOSE 3000
CMD ["node","/dist/ArduinoObstgarten/api/api.js"]

FROM node:lts-alpine

WORKDIR /dist

RUN mkdir -p /dist/Server && mkdir -p /dist/Login/www && mkdir -p /dist/ArduinoObstgarten/www

COPY ./Server/*.js ./Server/*.json /dist/Server/

COPY ./Login/*.json ./Login/*.js /dist/Login/
COPY ./Login/www/* /dist/Login/www/

COPY ./ArduinoObstgarten/*.json ./ArduinoObstgarten/*.js /dist/ArduinoObstgarten/
COPY ./ArduinoObstgarten/www/* /dist/ArduinoObstgarten/www/

RUN cd /dist/Server && npm install
RUN cd /dist/Login && npm install
RUN cd /dist/ArduinoObstgarten && npm install

EXPOSE 3000
EXPOSE 3030

CMD [ "node", "./Server/server.js" ]
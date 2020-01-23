FROM node:lts-alpine
MAINTAINER r.wetzelt@yahoo.de
WORKDIR /dist/
COPY ./Server/libredis.js /dist/
COPY ./*.json ./*.js /dist/

RUN npm install

EXPOSE 3000
CMD ["node","/dist/api.js"]

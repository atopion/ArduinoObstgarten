FROM node:lts-alpine
MAINTAINER r.wetzelt@yahoo.de
WORKDIR /dist
COPY ./*.json ./*.js /dist/

RUN npm install

EXPOSE 3000
CMD ["node","/dist/api.js"]

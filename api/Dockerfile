FROM node:lts-alpine
#FROM ubuntu:18.04
MAINTAINER r.wetzelt@yahoo.de
WORKDIR /dist/
COPY ./Server/libredis.js /dist/
COPY ./*.json ./*.js /dist/

RUN npm install

#RUN apt-get update && apt-get install -y --no-install-recommends \
#    python3.7 \
#    python3-pip \
#    && \
#apt-get clean && \
#rm -rf /var/lib/apt/lists/*

RUN apk add --update \
	python3.7 \
	python3-pip \
	&& rm -rf /var/cache/apk/*

RUN pip3 install pandas, seaborn, json, matplotlib, scipy

EXPOSE 3000
EXPOSE 3001

CMD ["node","/dist/api.js"] 

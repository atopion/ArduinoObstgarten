FROM node:lts-alpine
#FROM ubuntu:18.04
MAINTAINER r.wetzelt@yahoo.de
WORKDIR /dist/
RUN mkdir -p /dist/heatmap_creation/
COPY ./Server/libredis.js /dist/
COPY ./*.json ./*.js /dist/
COPY ./heatmap_creation/ /dist/heatmap_creation/

#RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories

RUN npm install

#RUN apt-get update && apt-get install -y --no-install-recommends \
#    python3.7 \
#    python3-pip \
#    && \
#apt-get clean && \
#rm -rf /var/lib/apt/lists/*

RUN apk update \ 
	&& apk add python3 py-pip \
	&& rm -rf /var/cache/apk/* \

RUN pip install pandas, seaborn, json, matplotlib, scipy

EXPOSE 3000
EXPOSE 3001

CMD ["node","/dist/api.js"] 

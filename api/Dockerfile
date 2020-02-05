FROM node:lts-buster-slim
#FROM node:lts-alpine
#FROM ubuntu:18.04
MAINTAINER r.wetzelt@yahoo.de
WORKDIR /dist/
RUN mkdir -p /dist/heatmap_creation/
COPY ./Server/libredis.js /dist/
COPY ./*.json ./*.js /dist/
COPY ./heatmap_creation/ /dist/heatmap_creation/

#RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories

RUN npm install

RUN apt-get update && apt-get install -y --no-install-recommends \
    		build-essential \
    		python3 \
    		python3-pip && \
    		apt-get clean && \
	rm -rf /var/lib/apt/lists/*

#RUN apk update \ 
#	&& apk add python3 py-pip \
#        && pip3 install --upgrade pip \
#        && apk add --no-cache python3-dev libstdc++ \
#        && apk add --no-cache g++ \
#	&& ln -s /usr/include/locale.h /usr/include/xlocale.h
	
#RUN echo "**** install Python ****" && \
#    apk add --no-cache python3 && \
#    if [ ! -e /usr/bin/python ]; then ln -sf python3 /usr/bin/python ; fi && \
#    \
#    echo "**** install pip ****" && \
#    python3 -m ensurepip && \
#    rm -r /usr/lib/python*/ensurepip && \
#    pip3 install --no-cache --upgrade pip setuptools wheel && \
#    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi

RUN pip3 install pandas seaborn matplotlib scipy

EXPOSE 3000
EXPOSE 3001

CMD ["node","/dist/api.js"] 

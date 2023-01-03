FROM node:14-alpine

RUN mkdir -p /opt

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /opt

COPY package.json Makefile ./

RUN npm install --no-package-lock

COPY . /opt

RUN apk --update add make
RUN apk --update add postgresql-client

RUN make build

CMD make start_server

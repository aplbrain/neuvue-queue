FROM node:16.10-alpine
LABEL maintainer "Daniel Xenes <daniel.xenes@jhuapl.edu>"

RUN apk add --no-cache su-exec tini
EXPOSE 80
ENV NODE_CONFIG_DIR=/etc/colocard
VOLUME [ "/etc/colocard" ]

COPY package.json tsconfig.json tslint.json yarn.lock /opt/colocard/
COPY src/ /opt/colocard/src/
COPY docs/ /opt/colocard/docs/
COPY public/ /opt/colocard/public/
COPY config/ /etc/colocard/

WORKDIR /opt/colocard
RUN yarn \
    && yarn run build

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "node", "/opt/colocard/build/bin/colocard" ]
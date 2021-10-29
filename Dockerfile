FROM node:16.10-alpine
LABEL maintainer "Daniel Xenes <daniel.xenes@jhuapl.edu>"

## NEW
CMD [ "node", "/opt/neuvuequeue/build/bin/neuvuequeue" ]
EXPOSE 9005
ENV NODE_CONFIG_DIR=/etc/neuvuequeue
VOLUME [ "/etc/neuvuequeue" ]

## OLD
RUN apk add --no-cache su-exec tini
EXPOSE 80
ENV NODE_CONFIG_DIR=/etc/colocard
VOLUME [ "/etc/colocard" ]

COPY package.json tsconfig.json tslint.json yarn.lock /opt/neuvuequeue/
COPY src/ /opt/neuvuequeue/src/
COPY docs/ /opt/neuvuequeue/docs/
COPY public/ /opt/neuvuequeue/public/
COPY config/ /etc/neuvuequeue/

WORKDIR /opt/neuvuequeue
RUN yarn \
    && yarn run build

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "node", "/opt/colocard/build/bin/colocard" ]
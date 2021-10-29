FROM node:16.10-alpine
LABEL maintainer "Daniel Xenes <daniel.xenes@jhuapl.edu>"

CMD [ "node", "/opt/neuvuequeue/build/bin/neuvuequeue" ]
EXPOSE 9005
ENV NODE_CONFIG_DIR=/etc/neuvuequeue
VOLUME [ "/etc/neuvuequeue" ]

COPY package.json tsconfig.json tslint.json yarn.lock /opt/neuvuequeue/
COPY src/ /opt/neuvuequeue/src/
COPY docs/ /opt/neuvuequeue/docs/
COPY public/ /opt/neuvuequeue/public/
COPY config/ /etc/neuvuequeue/

WORKDIR /opt/neuvuequeue
RUN yarn \
    && yarn run build


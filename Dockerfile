FROM node:20.19-bookworm-slim
LABEL maintainer="Daniel Xenes <daniel.xenes@jhuapl.edu>"

ARG YARN_STRICT_SSL=false

EXPOSE 80
ENV NODE_CONFIG_DIR=/etc/neuvuequeue
VOLUME [ "/etc/neuvuequeue" ]

COPY package.json tsconfig.json tsconfig.test.json tslint.json yarn.lock /opt/neuvuequeue/
COPY src/ /opt/neuvuequeue/src/
COPY docs/ /opt/neuvuequeue/docs/
COPY public/ /opt/neuvuequeue/public/
COPY config/ /etc/neuvuequeue/

WORKDIR /opt/neuvuequeue
RUN yarn config set strict-ssl "${YARN_STRICT_SSL}" \
    && yarn install --frozen-lockfile \
    && yarn run build

CMD [ "node", "/opt/neuvuequeue/build/bin/neuvuequeue.js" ]

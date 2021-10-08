FROM node:16.10-alpine
LABEL maintainer "Daniel Xenes <daniel.xenes@jhuapl.edu>"

CMD [ "node", "/opt/colocard/build/bin/colocard" ]
EXPOSE 9005
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


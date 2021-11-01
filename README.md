# Neuvue-Queue

Neuvue-Queue is a RESTful API based application server used by the family of neuvue applications for storing and retrieving data. It is a fork of [aplbrain/colocard](https://github.com/aplbrain/colocard).

## Getting Started

### Docker Compose

The recommended way to stand up neuvue-queue is to use docker-compose with the provided `docker-compose.yml` file in this repository. This will stand up a mongodb database along with the neuvue-queue server on port 9005. Note that this approach should only be used for development purposes.

```sh
git clone https://github.com/aplbrain/neuvue-queue
cd neuvue-queue
docker-compose up -d
```

### Bare Metal

If you wish to avoid running neuvue-queue in a container, you can easily build and run it locally. Note that you will need to have Node.js (>= 10.0.0) and yarn (>= 1.7.0) installed, along with a local mongodb instance running. Note that this approach should only be used for development purposes.

```sh
git clone https://github.com/aplbrain/neuvue-queue
cd neuvue-queue
yarn install
yarn run build
node ./build/bin/neuvue-queue
```

## Production Deployment

For deploying neuvue-queue in a production environment, see [automatizar](https://github.com/aplbrain/automatizar).

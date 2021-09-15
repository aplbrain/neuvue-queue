# colocard

[![CircleCI](https://circleci.com/gh/aplbrain/colocard.svg?style=svg&circle-token=465f173331a11a1e5373a7d87d3dc8a031f88bfa)](https://circleci.com/gh/aplbrain/colocard)

colocard is a RESTful API based application server used by the family of colocar applications for storing and retrieving data.

## Getting Started

### Docker Compose

The recommended way to stand up colocard is to use docker-compose with the provided `docker-compose.yml` file in this repository. This will stand up a mongodb database along with the colocard server on port 9005. Note that this approach should only be used for development purposes.

```sh
git clone https://github.com/aplbrain/colocard
cd colocard
docker-compose up -d
```

### Bare Metal

If you wish to avoid running colocard in a container, you can easily build and run it locally. Note that you will need to have Node.js (>= 10.0.0) and yarn (>= 1.7.0) installed, along with a local mongodb instance running. Note that this approach should only be used for development purposes.

```sh
git clone https://github.com/aplbrain/colocard
cd colocard
yarn install
yarn run build
node ./build/bin/colocard
```

## Production Deployment

For deploying colocard in a production environment, see [automatizar](https://github.com/aplbrain/automatizar).

# Agent Notes

## Project Overview

Neuvue-Queue is a TypeScript/Node REST API backed by MongoDB. It uses Restify for HTTP routing, Mongoose for persistence, Auth0/JWT middleware for protected routes, and Swagger UI/OpenAPI files for API docs.

The main runtime path is:

- `src/bin/neuvuequeue.ts`: reads configuration via `config` and starts the service.
- `src/neuvuequeue.ts`: connects to MongoDB, configures Restify middleware, serves Swagger/static files, and attaches controllers.
- `src/controllers/`: route registration and request handlers.
- `src/models/`: Mongoose schemas.
- `src/utils/`: shared middleware, serializers, file handlers, mixin helpers, and Mongo URI creation.
- `docs/neuvuequeue.yaml`: OpenAPI documentation served at `/docs/neuvuequeue.yaml`.
- `public/index.html`: Swagger UI shell served from `/`.

## Setup And Commands

Use Yarn v1 with the checked-in `yarn.lock`.

```sh
yarn install
yarn run build
yarn run tslint
yarn run unit-test
yarn run test
```

Useful commands:

- `yarn run build`: TypeScript compile to `build/`.
- `yarn run watch`: TypeScript watch mode.
- `yarn run tslint`: TSLint project lint.
- `yarn run unit-test`: unit tests matching `test/**/*.unit.test.ts`.
- `yarn run integration-test`: integration tests matching `test/**/*.integration.test.ts`.
- `yarn run test`: all `test/**/*.test.ts` files.
- `docker-compose up -d`: local MongoDB plus API service.

For local bare-metal runs, start MongoDB separately, then:

```sh
yarn install
yarn run build
node ./build/bin/neuvuequeue.js
```

## Runtime Configuration

Default config lives in `config/default.json`. Environment variable mappings live in `config/custom-environment-variables.json`.

Important environment variables:

- `NEUVUEQUEUE_MONGODB_DATABASE`
- `NEUVUEQUEUE_MONGODB_HOST`
- `NEUVUEQUEUE_MONGODB_PORT`
- `NEUVUEQUEUE_SERVER_HOST`
- `NEUVUEQUEUE_SERVER_PORT`
- `NEUVUEQUEUE_LOG_LEVEL`
- `AUTH0_DOMAIN`
- `AUTH0_AUDIENCE`
- `AUTH0_CLIENTID`
- `AUTH0CLIENTSECRET`

Auth-protected routes expect Auth0 JWTs with `permissions` and `allowed_namespaces` payload fields. Namespace authorization is enforced in `CRUDMixin.ensureNamespaceAuthorizedForPatch` and `CRUDMixin.insert`.

## Code Style

- TypeScript target is ES6/CommonJS with `noImplicitAny` and `strictNullChecks` enabled.
- Follow the existing TSLint rules: double quotes, 120-character max line length, no interface `I` prefix.
- Prefer existing Restify/Mongoose callback style when editing nearby controller code unless a wider refactor is requested.
- Keep model schema changes in `src/models/*` synchronized with route behavior and `docs/neuvuequeue.yaml`.
- Do not edit `build/` for source changes. It is compiled output.
- Preserve the current API shape and response behavior unless the task explicitly asks for a breaking change.

## Architecture Notes

Controllers extend `Controller` through `mix(Controller).with(...)`. Shared CRUD behavior is in `src/controllers/mixins.ts`:

- `query` supports `q` as JSON, pagination via `p`/`pageSize`, `populate`, `select`, and `sort`.
- `detail` supports `populate`, `select`, and `sort`.
- `insert` validates Mongoose documents, checks namespace permissions, then uses `collection.insertMany`.
- `deactivate` soft-deletes by setting `active: false`.

Current controller roots:

- `/points` -> `PointController`
- `/tasks` -> `TaskController`
- `/auth` -> `AuthController`
- `/differstacks` -> `DifferStackController`
- `/agents` -> `AgentsJobController`

When adding a resource, update all of:

- `src/models/index.ts`
- `src/controllers/index.ts`
- A controller in `src/controllers/`
- A model in `src/models/`
- `docs/neuvuequeue.yaml`

## Testing Guidance

Unit tests currently cover utility behavior in `test/utils`. Add focused unit tests for pure helpers and lower-level behavior. For controller or auth changes, prefer tests that exercise route behavior and authorization paths, and document any required MongoDB/Auth0 setup if a true integration test is needed.

Run at least `yarn run build` and the most relevant test command before handing off changes. Run `yarn run tslint` when touching TypeScript.

## Gotchas

- `docker-compose.yml` maps the API on host port `80`, while the README mentions port `9005`; check the compose file before relying on README port text.
- `docs/neuvuequeue.yaml` may lag behind schemas; verify enum values and field names against `src/models/*`.
- Auth0 token exchange in `AuthController` uses a hard-coded Auth0 token URL and env vars for client credentials.
- Some protected route detail/delete behavior is inconsistent across controllers; inspect the specific controller before assuming auth middleware is attached.
- `controllers/index.ts` option keys use `differstack` and `agentsjob` lookups even though the interface names use `differ_stack` and `agents_job`.

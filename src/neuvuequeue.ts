import fs from "fs";
import path from "path";

import _ from "lodash/fp";
import mongoose from "mongoose";
import pino from "pino";
import restify, { Server } from "restify";
import corsMiddleware from "restify-cors-middleware";
import * as swagger from "swagger-ui-dist";

import controllers from "./controllers";
import utils from "./utils";


export interface NeuvueQueueConfig {
    mongodb: {
        database: string,
        host: string | string[],
        // TODO This typing should be better, but the previous option of using 
        // mongoose.ConnectionOptions is deprecated in the newest version of mongoose
        options?: any,
        port: number | number[],
    };
    server: {
        host: string,
        logLevel: string,
        port: number,
    };
}

export enum NeuvueQueueLogLevel {
    Fatal = "fatal",
    Error = "error",
    Warn = "warn",
    Info = "info",
    Debug = "debug",
    Trace = "trace",
    Silent = "silent",
}

export function isValidNeuvueQueueLogLevel(level: string): boolean {
    const values = _.values(NeuvueQueueLogLevel);
    return _.contains(level, values);
}

export default class NeuvueQueue {
    public readonly configuration: NeuvueQueueConfig;
    private logger: pino.BaseLogger;
    private server: Server;
    constructor(config: NeuvueQueueConfig) {
        this.configuration = config;
        if (isValidNeuvueQueueLogLevel(this.configuration.server.logLevel)) {
            this.logger = pino({
                level: this.configuration.server.logLevel,
                serializers: {
                    error: pino.stdSerializers.err,
                    request: utils.serializers.request,
                    response: utils.serializers.response,
                },
            });
        } else {
            this.logger = pino({
                serializers: {
                    error: pino.stdSerializers.err,
                    request: utils.serializers.request,
                    response: utils.serializers.response,
                },
            });
            this.logger.warn(
                "invalid log level found: \"%s\", defaulting to \"info\"",
                this.configuration.server.logLevel,
            );
        }
    }

    public async start() {
        try {
            this.logger.info({ config: this.configuration }, "starting NeuvueQueue instance");
            await this.launch();
        } catch (err) {
            this.logger.fatal({ error: err }, "failed to start NeuvueQueue instance");
            throw err;
        }
    }

    private async launch() {
        const mongoUri = utils.createMongoUri(
            this.configuration.mongodb.host,
            this.configuration.mongodb.port,
            this.configuration.mongodb.database,
        );
        await mongoose.connect(mongoUri, this.configuration.mongodb.options);
        this.logger.debug("connected to MongoDB at %s", mongoUri);

        const server = restify.createServer();
        const cors = corsMiddleware({
            allowHeaders: ["Authorization", "x-request-id"],
            credentials: false,
            exposeHeaders: [],
            origins: ["*"],
        });

        server.pre(restify.pre.sanitizePath());
        server.pre(cors.preflight);
        server.use(cors.actual);
        server.use(utils.middleware.requestId());
        server.use(utils.middleware.log(this.logger));
        server.use(restify.plugins.jsonBodyParser());
        server.use(restify.plugins.queryParser());
        server.get("/", utils.handlers.serveFile(path.join(__dirname, "..", "public", "index.html")));

        server.get("/docs/*", restify.plugins.serveStatic({
            appendRequestPath: false,
            directory: "./docs",
        }));

        server.get("/swagger/*", restify.plugins.serveStatic({
            appendRequestPath: false,
            directory: swagger.absolutePath(),
        }));

        controllers.attach(server, {
            point: {
                detail: { populate: ["points"] },
                query: { populate: ["points"] },
            },
        });

        server.on("restifyError", utils.middleware.logErrorCallback(this.logger));

        this.server = server;
        await new Promise<void>((resolve, reject) => {
            this.server.listen(this.configuration.server.port, this.configuration.server.host, () => {
                resolve();
            });
        });
        this.logger.info("NeuvueQueue instance running");
    }

    public async stop() {
        try {
            this.logger.info("shutting down NeuvueQueue instance");
            this.halt();
        } catch (err) {
            this.logger.fatal({ error: err }, "failed to gracefully shutdown NeuvueQueue instance");
            throw err;
        }
    }

    private async halt() {
        this.server.close();
        await mongoose.connection.close();
    }
}

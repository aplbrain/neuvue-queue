import config from "config";

import Colocard, { ColocardConfig } from "../colocard";

const database = config.get<string>("mongodb.database");
const mongodbHost = config.get<string>("mongodb.host");
const mongodbPort = config.get<number>("mongodb.port");
const serverHost = config.get<string>("server.host");
const serverLogLevel = config.get<string>("server.logLevel");
const serverPort = config.get<number>("server.port");

(async function() {
    const configuration: ColocardConfig = {
        mongodb: {
            database,
            host: mongodbHost,
            port: mongodbPort,
        },
        server: {
            host: serverHost,
            logLevel: serverLogLevel,
            port: serverPort,
        },
    };
    const colocard = new Colocard(configuration);
    await colocard.start();
})().catch(() => {
    process.exit(1);
});

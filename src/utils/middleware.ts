import finished from "on-finished";
import headers from "on-headers";
import { BaseLogger } from "pino";
import { Next, Request, RequestHandlerType, Response } from "restify";

export function log(logger: BaseLogger): RequestHandlerType {
    return function logRequest(req: Request, res: Response, next: Next) {

        logger.info({ request: req }, "request received");
        headers(res, function() {
            logger.info({ request: req }, "response started");
        });
        finished(res, function() {
            logger.info({ request: req, response: res }, "response finished");
        });

        next();
    };
}

export function logErrorCallback(logger: BaseLogger): (req: Request, res: Response, err: Error, cb: Next) => void {
    return function(req: Request, res: Response, err: Error, cb: Next) {
        logger.error({ request: req, response: res, error: err }, "error");
        cb();
    };
}

export function requestId(): RequestHandlerType {
    return function(req: Request, res: Response, next: Next) {
        const reqId = req.header("x-request-id", "");
        if (reqId) {
            // @ts-ignore: bad declaration file...
            req.id(reqId);
        }
        return next();
    };
}

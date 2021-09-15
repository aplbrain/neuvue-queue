import fs from "fs";

import mime from "mime";
import { Next, Request, RequestHandlerType, Response } from "restify";
import { ResourceNotFoundError } from "restify-errors";

export function serveFile(file: string): RequestHandlerType {
    return function(req: Request, res: Response, next: Next) {
        fs.stat(file, (err, stats) => {
            if (err || !stats.isFile()) {
                return next(new ResourceNotFoundError(`${file} not found`));
            }

            const stream = fs.createReadStream(file);
            stream.once("open", (fd) => {
                res.set("Content-Length", stats.size.toString());
                res.set("Content-Type", mime.getType(file) || "application/octet-stream");
                res.set("Last-Modified", stats.mtime.toString());

                res.writeHead(200);
                stream.pipe(res);
                stream.once("close", () => {
                    next(false);
                });
            });

            res.once("close", () => {
                stream.close();
            });
        });
    };
}

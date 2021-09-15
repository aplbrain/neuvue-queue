import { Request, Response } from "restify";

export function request(req: Request) {
    return {
        address: req.connection.remoteAddress,
        headers: req.headers,
        id: req.getId(),
        method: req.method,
        params: req.params,
        route: (req.getRoute() ? req.getRoute().path : undefined),
        url: req.url,
    };
}

export function response(res: Response) {
    return {
        headers: res.getHeaders(),
        status: res.statusCode,
    };
}

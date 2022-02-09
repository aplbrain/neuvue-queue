import _ from "lodash/fp";
import { Document, Model } from "mongoose";
import { Server } from "restify";
import { Next, Request, Response } from "restify";
import { BadRequestError, NotFoundError } from "restify-errors";

import mix from "../utils/mix";
import Controller from "./controller";
import { CRUDMixin, DecidableMixin, DetailOptions, QueryOptions } from "./mixins";
import auth0 from '../lib/auth0';
import axios from "axios"

export interface AuthControllerOptions {
    detail?: DetailOptions;
    query?: QueryOptions;
}

export default class AuthController extends mix(Controller).with(CRUDMixin, DecidableMixin) {
    private model: Model<Document>;
    constructor(model: Model<Document>) {
        super();
        this.model = model;
    }
    public postAuthCodeStatus(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next) => {
            let code = req.body.code;
            let code_type = req.body.code_type;
            var opts:any;
            console.log("CODE", code)
            // TODO READ CLIENT ID AND SECRET FROM FILE OR ENV VAR
            if (code_type == "authorization") {
                opts = {
                    method: 'POST',
                    url: 'https://dev-oe-jgl7m.us.auth0.com/oauth/token',
                    headers: {'content-type': 'application/json'},
                    data: {
                        grant_type: 'authorization_code',
                        client_id: process.env.AUTH0_CLIENTID,
                        client_secret: process.env.AUTH0CLIENTSECRET,
                        code: code,
                        redirect_uri: 'https://app.neuvue.io/'
                    }
                };
            } else if (code_type == "refresh") {
                opts = {
                    method: 'POST',
                    url: 'https://dev-oe-jgl7m.us.auth0.com/oauth/token',
                    headers: {'content-type': 'application/json'},
                    data: {
                      grant_type: 'refresh_token',
                      client_id: process.env.AUTH0_CLIENTID,
                      client_secret: process.env.AUTH0CLIENTSECRET,
                      refresh_token: code
                    }
                  };
            }
            console.log(opts);
            axios.request(opts).then(function (tokens: any) {
                console.log(tokens.data.access_token, tokens.data.refresh_token);
                res.status(201);
                res.json(tokens.data);
            })
            .catch(function (error:any) {
                console.error(error);
                next(new BadRequestError(error.message));
            });
        };
    };
    public attachTo(root: string, server: Server, options?: AuthControllerOptions): void {
        console.log("ATTACH HERE", root)
        if (root.endsWith("/")) {
            root = root.substring(0, root.length - 1);
        }
        // server.get(root, this.query(_.get("query", options)));

        server.post(`${root}/tokens`, this.postAuthCodeStatus());
    }
}

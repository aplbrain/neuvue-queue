import _ from "lodash/fp";
import { Document, Model } from "mongoose";
import { Server } from "restify";

import mix from "../utils/mix";
import Controller from "./controller";
import { CRUDMixin, DecidableMixin, DetailOptions, QueryOptions } from "./mixins";
import auth0 from '../lib/auth0';
// import requiredScopes from '../lib/required-scopes';

export interface PointControllerOptions {
    detail?: DetailOptions;
    query?: QueryOptions;
}

export default class PointController extends mix(Controller).with(CRUDMixin, DecidableMixin) {
    private model: Model<Document>;
    constructor(model: Model<Document>) {
        super();
        this.model = model;
    }

    public attachTo(root: string, server: Server, options?: PointControllerOptions): void {
        if (root.endsWith("/")) {
            root = root.substring(0, root.length - 1);
        }

        const readScopes = 'read:points';
        const writeScopes = 'update:points';

        server.get(root, auth0(true, readScopes), this.query(_.get("query", options)));
        server.get(`${root}/:id`, this.detail(_.get("detail", options)));
        server.post(root, auth0(true, writeScopes), this.insert());
        server.del(`${root}/:id`, this.deactivate());
    }
}

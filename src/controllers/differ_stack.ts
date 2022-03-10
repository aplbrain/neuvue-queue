import _ from "lodash/fp";
import { Document, Model } from "mongoose";
import { Server } from "restify";

import mix from "../utils/mix";
import Controller from "./controller";
import { CRUDMixin, DetailOptions, QueryOptions } from "./mixins";
import auth0 from '../lib/auth0';

export interface DifferStackControllerOptions {
    detail?: DetailOptions;
    query?: QueryOptions;
}

export default class DifferStackController extends mix(Controller).with(CRUDMixin) {
    private model: Model<Document>;
    constructor(model: Model<Document>) {
        super();
        this.model = model;
    }

    public attachTo(root: string, server: Server, options?: DifferStackControllerOptions): void {
        if (root.endsWith("/")) {
            root = root.substring(0, root.length - 1);
        }
        const readScopes = 'read:tasks';
        const writeScopes = 'update:tasks';

        server.get(root, auth0(true, readScopes), this.query(_.get("query", options)));
        server.get(`${root}/:id`, this.detail(_.get("detail", options)));
        server.post(root, auth0(true, writeScopes), this.insert());
        server.del(`${root}/:id`, auth0(true, writeScopes), this.deactivate());
    }
}

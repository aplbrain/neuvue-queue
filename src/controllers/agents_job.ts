import _ from "lodash/fp";
import { Document, Model } from "mongoose";
import { Server } from "restify";

import mix from "../utils/mix";
import Controller from "./controller";
import { CRUDMixin, DetailOptions, QueryOptions } from "./mixins";

export interface AgentsJobControllerOptions {
    detail?: DetailOptions;
    query?: QueryOptions;
}

export default class AgentsJobController extends mix(Controller).with(CRUDMixin) {
    private model: Model<Document>;
    constructor(model: Model<Document>) {
        super();
        this.model = model;
    }

    public attachTo(root: string, server: Server, options?: AgentsJobControllerOptions): void {
        if (root.endsWith("/")) {
            root = root.substring(0, root.length - 1);
        }
        const readScopes = 'read:tasks';
        const writeScopes = 'update:tasks';

        server.get(root, this.query(_.get("query", options)));
        server.get(`${root}/:id`, this.detail(_.get("detail", options)));
        server.post(root, this.insert());
        server.del(`${root}/:id`, this.deactivate());
    }
}

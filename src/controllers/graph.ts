import _ from "lodash/fp";
import { Document, Model } from "mongoose";
import { Server } from "restify";

import mix from "../utils/mix";
import Controller from "./controller";
import { CRUDMixin, DecidableMixin, DetailOptions, QueryOptions } from "./mixins";

export interface GraphControllerOptions {
    detail?: DetailOptions;
    query?: QueryOptions;
}

export default class GraphController extends mix(Controller).with(CRUDMixin, DecidableMixin) {
    private model: Model<Document>;
    constructor(model: Model<Document>) {
        super();
        this.model = model;
    }

    public attachTo(root: string, server: Server, options?: GraphControllerOptions): void {
        if (root.endsWith("/")) {
            root = root.substring(0, root.length - 1);
        }
        server.get(root, this.query(_.get("query", options)));
        server.get(`${root}/:id`, this.detail(_.get("detail", options)));
        server.post(root, this.insert());
        server.del(`${root}/:id`, this.deactivate());
        server.patch(`${root}/:id/decisions`, this.appendDecision());
        server.del(
            `${root}/:objectId/decisions/:decisionId`, this.deactivateDecision(),
        );
    }
}

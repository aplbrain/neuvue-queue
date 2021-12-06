import _ from "lodash/fp";
import { Document, Model } from "mongoose";
import { Next, Request, Response, Server } from "restify";
import { BadRequestError, NotFoundError } from "restify-errors";
import mix from "../utils/mix";
import Controller from "./controller";
import { CRUDMixin, DetailOptions, QueryOptions } from "./mixins";
import auth0 from '../lib/auth0';


export interface TaskControllerOptions {
    detail?: DetailOptions;
    query?: QueryOptions;
}

export default class TaskController extends mix(Controller).with(CRUDMixin) {
    private model: Model<Document>;
    constructor(model: Model<Document>) {
        super();
        this.model = model;
    }

    public setStatus(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {

            const update: { [key: string]: any } = { status: req.body.status };

            if (update.status === "pending") {
                update.closed = null;
                update.opened = null;
            } else if (update.status === "open") {
                update.opened = Date.now();
            } else if (update.status === "closed" || update.status === "errored") {
                update.closed = Date.now();
            }

            this.model.findByIdAndUpdate(req.params.id, update, (err:any, old:any) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else {
                        return next(err);
                    }
                }
                res.json(old);
                res.end();
            });
        };
    }

    public setPriority(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {

            if (!_.isNumber(req.body.priority) || req.body.priority < 0) {
                return next(new BadRequestError("priority must be a number >= 0"));
            }

            const update: { [key: string]: any } = { priority: req.body.priority };

            this.model.findByIdAndUpdate(req.params.id, update, (err:any, old:any) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else {
                        return next(err);
                    }
                }
                res.json(old);
                res.end();
            });
        };
    }

    public setInstructions(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {

            if (!_.isPlainObject(req.body.instructions)) {
                return next(new BadRequestError("instructions must be a plain object"));
            }

            const update: { [key: string]: any } = { instructions: req.body.instructions };

            this.model.findByIdAndUpdate(req.params.id, update, (err:any, old:any) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else {
                        return next(err);
                    }
                }
                res.json(old);
                res.end();
            });
        }
    }

    public incDuration(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {

            if (!_.isNumber(req.body.duration) || req.body.duration < 0) {
                return next(new BadRequestError("duration must be a number >= 0"));
            }
            const update = { $inc: {duration: req.body.duration}}
            this.model.findByIdAndUpdate(req.params.id, update, (err:any, old:any) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else {
                        return next(err);
                    }
                }
                res.json(old);
                res.end();
            });
        };
    }

    public appendPoint(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {
            const id = req.params.id;
            const point = req.body;

            const update = { $push: { points: point } };
            const options = { runValidators: true };

            this.model.findByIdAndUpdate(id, update, options, (err, old) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else if (err.name === "ValidationError") {
                        return next(new BadRequestError(err.message));
                    } else {
                        return next(err);
                    }
                }
                res.json(old);
                res.end();
            });
        };
    }


    public deactivatePoint(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {
            const objId = req.params.objectId;
            const pointId = req.params.artifactId;

            const query = { "_id": objId, "points._id": pointId };
            const update = { $set: { "points.$.active": false } };
            try {
                this.model.findOneAndUpdate(query, update);
                res.status(204);
                res.end();
                
            }   catch(err) {
                res.status(500);
                if (err.name === "DocumentNotFoundError") {
                    return next(new NotFoundError(`${req.params.id} does not exist`));
                } else {
                    return next(err);
                }
            }
        };
    }
    
    public setMetadata(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {
            const id = req.params.id;
            const metadata = req.body;
            
            if (!_.isPlainObject(metadata)) {
                return next(new BadRequestError("metadata must be a plain object"));
            }
            const update: { [key: string]: any } = { metadata: req.body };
            this.model.findByIdAndUpdate(id, update, (err:any, old:any) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else if (err.name === "ValidationError") {
                        return next(new BadRequestError(err.message));
                    } else {
                        return next(err);
                    }
                }
                res.json(old);
                res.end();
            });
        };
    }

    public setNgState(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {
            const id = req.params.id;
            const ng_state = req.body
            
            if (!_.isPlainObject(ng_state)) {
                return next(new BadRequestError("state must be a plain object"));
            }
            const update: { [key: string]: any } = { ng_state: req.body.ng_state };
            this.model.findByIdAndUpdate(id, update, (err:any, old:any) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else if (err.name === "ValidationError") {
                        return next(new BadRequestError(err.message));
                    } else {
                        return next(err);
                    }
                }
                res.json(old);
                res.end();
            });
        };
    }

    public attachTo(root: string, server: Server, options?: TaskControllerOptions): void {
        if (root.endsWith("/")) {
            root = root.substring(0, root.length - 1);
        }
        const readScopes = 'read:tasks';
        const writeScopes = 'update:tasks';

        server.get(root, this.query(_.get("query", options)));
        server.get(`${root}/:id`, this.detail(_.get("detail", options)));
        server.post(root, auth0(true), this.insert());
        server.del(`${root}/:id`, auth0(true),this.deactivate());
        server.patch(`${root}/:id/instructions`, auth0(true), this.setInstructions());
        server.patch(`${root}/:id/priority`, auth0(true), this.setPriority());
        server.patch(`${root}/:id/duration`, auth0(true), this.incDuration());
        server.patch(`${root}/:id/status`, auth0(true), this.setStatus());
        server.patch(`${root}/:id/points`, auth0(true), this.appendPoint());
        server.patch(`${root}/:id/metadata`, auth0(true), this.setMetadata());
        server.patch(`${root}/:id/ng_state`, auth0(true), this.setNgState());
        server.del(
            `${root}/:objectId/points/:pointId`, auth0(true), this.deactivatePoint(),
        );
    }
}

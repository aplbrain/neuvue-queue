import url from "url";

import _ from "lodash/fp";
import { Document, Model } from "mongoose";
import { Next, Request, Response } from "restify";
import { BadRequestError, NotFoundError } from "restify-errors";

export interface DetailOptions {
    populate?: string[];
    select?: string;
    sort?: string;
}

export interface QueryOptions {
    pageSize?: number;
    populate?: string[];
    select?: string[];
    sort?: string[];
}

export const CRUDMixin = (superclass: any) => class extends superclass {
    protected model: Model<Document>;

    public deactivate(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next) => {
            this.model.findByIdAndUpdate(req.params.id, { active: false }, (err) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else {
                        return next(err);
                    }
                }
                res.status(204);
                res.end();
            });
        };
    }

    public detail(options?: DetailOptions): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next) => {
            let query = this.model.findById(req.params.id);
            let populate: string | string[] = _.get("populate", req.query) || _.get("populate", options);
            const select: string | undefined = _.get("select", req.query) || _.get("select", options);
            const sort: string | undefined = _.get("sort", req.query) || _.get("sort", options);
            if (populate) {
                if (!Array.isArray(populate)) {
                    populate = populate.replace(/,/g, " ").split(/\s+/);
                }
                for (const field of populate) {
                    query = query.populate(field);
                }
            }
            if (select) {
                query = query.select(select.replace(/,/g, " "));
            }
            if (sort) {
                query = query.sort(sort.replace(/,/g, " "));
            }

            query.exec((err, doc) => {
                if (err) {
                    if (err.name === "DocumentNotFoundError") {
                        return next(new NotFoundError(`${req.params.id} does not exist`));
                    } else {
                        return next(err);
                    }
                }

                res.json(doc);
            });
        };
    }

    public insert(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next) => {
            let body = req.body;
            if (!Array.isArray(body)) {
                body = Array.of(body);
            }
            const documents = _.map((raw: object) => new this.model(raw), body);
            Promise.all(_.map((doc: Document) => doc.validate(), documents))
                .then(() => this.beforeInsert(documents))
                .then((documents) => {
                    const objs = _.map((doc: Document) => doc.toObject(), documents);
                    // Nesting then/catch statements because we want to handle
                    // errors very differently.
                    this.model.collection.insertMany(objs)
                        .then(() => this.afterInsert(objs))
                        .then((objs) => {
                            res.status(201);
                            res.json(objs);
                        })
                        .catch((err) => {
                            next(err);
                        });
                })
                .catch((err: Error) => {
                    next(new BadRequestError(err.message));
                });
        };
    }

    protected beforeInsert(documents: Document[]): Promise<Document[]> {
        return Promise.resolve(documents);
    }

    protected afterInsert(objs: any[]): Promise<any[]> {
        return Promise.resolve(objs);
    }

    public query(options?: QueryOptions): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next) => {
            function makeLink(page: number, rel: string): string {
                const path = url.parse(req.url as string, true);
                path.query.p = page.toString();
                // THIS LINE IS DEPRECATED - NEED HELP
                // delete path.search; // required for url.format to re-generate querystring
                const href = url.format(path);
                return `<${href}>; rel="${rel}"`;
            }

            let query = this.model.find({});
            let countQuery = this.model.find({});
            let populate: string | string[] = _.get("populate", req.query) || _.get("populate", options);
            const select: string | undefined = _.get("select", req.query) || _.get("select", options);
            const sort: string | undefined = _.get("sort", req.query) || _.get("sort", options);
            const pageSize = _.getOr(100, "pageSize", options) as number; // shouldn't be needed

            if (req.query.q) {
                try {
                    const q = JSON.parse(req.query.q);
                    query = query.where(q);
                    countQuery = countQuery.where(q);
                } catch (err) {
                    return next(new BadRequestError("query is not a valid JSON object"));
                }
            }
            if (populate) {
                if (!Array.isArray(populate)) {
                    populate = populate.replace(/,/g, " ").split(/\s+/);
                }
                for (const field of populate) {
                    query = query.populate(field);
                }
            }
            if (select) {
                query = query.select(select.replace(/,/g, " "));
            }
            if (sort) {
                query = query.sort(sort.replace(/,/g, " "));
            }

            const page = Number(req.query.p) >= 0 ? Number(req.query.p) : 0;
            const requestedPageSize = Number(req.query.pageSize) > 0 ? Number(req.query.pageSize) : pageSize;

            query.skip(requestedPageSize * page);
            query.limit(requestedPageSize + 1);

            Promise.all([
                query.then(),
                countQuery.count().then(),
            ]).then(([docs, count]: [Document[], number]) => {
                // Build pagination links.
                let link = makeLink(0, "first");
                // rel: prev
                if (page > 0) {
                    link += ", " + makeLink(page - 1, "prev");
                }
                // rel: next
                if (docs.length > requestedPageSize) {
                    // remove last document - we used it as a flag to check if
                    // values exist beyond the page size.
                    docs.pop();
                    link += ", " + makeLink(page + 1, "next");
                }
                // rel: last
                const lastPage = Math.floor(count / requestedPageSize);
                link += ", " + makeLink(lastPage, "last");

                res.setHeader("link", link);
                res.setHeader("X-Total-Count", count);

                res.json(docs);

            }).catch((err) => {
                return next(err);
            });
        };
    }
};

export const DecidableMixin = (superclass: any) => class extends superclass {
    protected model: Model<Document>;

    public appendDecision(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {
            const id = req.params.id;
            const decision = req.body;

            const update = { $push: { decisions: decision } };
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

    public deactivateDecision(): (req: Request, res: Response, next: Next) => void {
        return (req: Request, res: Response, next: Next): void => {
            const objId = req.params.objectId;
            const decisionId = req.params.decisionId;

            const query = { "_id": objId, "decisions._id": decisionId };
            const update = { $set: { "decisions.$.active": false } };
            try {
                this.model.findOneAndUpdate(query, update);
                res.status(204);
                res.end();
                
            }   catch(err) {
                res.status(500);
                return next(err);
            }
        };
    }
};

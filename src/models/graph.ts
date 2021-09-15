import { model, Schema } from "mongoose";

import decision from "./decision";

const structure = new Schema({
    directed: { type: Boolean, required: true },
    graph: { type: Map, of: Schema.Types.Mixed, default: {} },
    links: { type: [Schema.Types.Mixed] },
    multigraph: { type: Boolean, required: true },
    nodes: { type: [Schema.Types.Mixed] },
});

const schema = new Schema({
    active: { type: Boolean, default: true },
    author: { type: String, required: true },
    decisions: { type: [decision], default: [] },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    namespace: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, default: null },
    structure: { type: structure, required: true },
    submitted: { type: Number, default: Date.now, min: 0 },
    volume: { type: Schema.Types.ObjectId, required: true, ref: "Volume" },
});

const Graph = model("Graph", schema);

export default Graph;

import { model, Schema } from "mongoose";

const adaptivePrioritySchema = new Schema({
    bias: { type: Number, default: 0 },
    categories: { type: Map, of: Schema.Types.Mixed, default: {} },
    contributions: { type: Map, of: Number, default: {} },
    enabled: { type: Boolean, default: false },
    max: { type: Number, default: null },
    min: { type: Number, default: 0 },
    priors: { type: Map, of: Schema.Types.Mixed, default: {} },
    provenance: { type: Map, of: Schema.Types.Mixed, default: {} },
    score: { type: Number, default: null },
    strategy: {
        default: "weighted_sum_v1",
        enum: ["weighted_sum_v1"],
        type: String,
    },
    updated: { type: Number, default: null },
    weights: { type: Map, of: Number, default: {} },
}, { _id: false });

const schema = new Schema({
    active: { type: Boolean, default: true },
    assignee: { type: String, required: true, index: true },
    author: { type: String, required: true },
    closed: { type: Number, default: null, min: 0 },
    created: { type: Number, default: Date.now, min: 0 },
    instructions: { type: Map, of: Schema.Types.Mixed, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    namespace: { type: String, required: true },
    opened: { type: Number, default: null, min: 0 },
    priority: { type: Number, required: true, min: 0 },
    adaptive_priority: { type: adaptivePrioritySchema, default: {} },
    duration: { type: Number, default: 0, min: 0 },
    status: {
        default: "pending",
        enum: ["closed", "errored", "open", "pending"],
        type: String,
    },
    seg_id: {type: String, default: null},
    ng_state: {type: String, default: null},
    points: {type: [Schema.Types.ObjectId], default: [], ref: "Point"},
    tags: {type: [String], default: []}
});

schema.index({ active: 1, status: 1, namespace: 1, priority: -1 });

const Task = model("Task", schema);

export default Task;

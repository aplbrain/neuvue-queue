import { model, Schema } from "mongoose";

import point from "./point";

const schema = new Schema({
    active: { type: Boolean, default: true },
    assignee: { type: String, required: true },
    author: { type: String, required: true },
    closed: { type: Number, default: null, min: 0 },
    created: { type: Number, default: Date.now, min: 0 },
    instructions: { type: Map, of: Schema.Types.Mixed, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    namespace: { type: String, required: true },
    opened: { type: Number, default: null, min: 0 },
    priority: { type: Number, required: true, min: 0 },
    status: {
        default: "pending",
        enum: ["completed", "errored", "open", "pending"],
        type: String,
    },
    neuron_status: { 
        default: "incomplete", 
        enum: ["complete", "incomplete"], 
        type: String},
    points: {type: [point], default: []}
});

const Task = model("Task", schema);

export default Task;

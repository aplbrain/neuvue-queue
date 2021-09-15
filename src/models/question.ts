import { model, Schema } from "mongoose";

import artifact from "./artifact";

const schema = new Schema({
    active: { type: Boolean, default: true },
    artifacts: { type: [artifact], default: [] },
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
        enum: ["complete", "errored", "open", "pending"],
        type: String,
    },
    volume: { type: Schema.Types.ObjectId, required: true, ref: "Volume" },
});

const Question = model("Question", schema);

export default Question;

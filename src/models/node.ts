import { model, Schema } from "mongoose";

import decision from "./decision";

const schema = new Schema({
    active: { type: Boolean, default: true },
    author: { type: String, required: true },
    coordinate: {
        required: true,
        type: [Number],
        validate: {
            validator(value: number[]) {
                return value.length === 3;
            },
        },
    },
    created: { type: Number, required: true, min: 0 },
    decisions: { type: [decision], default: [] },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    namespace: { type: String, required: true },
    submitted: { type: Number, default: Date.now, min: 0 },
    type: { type: String, required: true },
    volume: { type: Schema.Types.ObjectId, required: true, ref: "Volume" },
});

const Node = model("Node", schema);

export default Node;

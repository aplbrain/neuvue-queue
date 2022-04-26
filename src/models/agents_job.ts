import { model, Schema } from "mongoose";

const schema = new Schema({
    active: { type: Boolean, default: true },
    endpoint: {
        required: true,
        type: [Number],
        validate: {
            validator(value: number[]) {
                return value.length === 3;
            },
        },
    },
    source: { type: String, required: true },
    target: { type: String, required: true },
    weight: { type: Number, required: true },
    created: { type: Number, default: null, min: 0 },
    merge_points: {type: [[Number]], default: []}
});

const AgentsJob = model("AgentsJob", schema);

export default AgentsJob;

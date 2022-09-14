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
    seg_id: { type: String, required: true },
    nucleus_id: { type: String, default: null},
    merges: { type: Map, of: Schema.Types.Mixed, default: {}},
    metadata: { type: Map, of: Schema.Types.Mixed, default: {}},
    created: { type: Number, default: null, min: 0 },
    namespace: { type: String, default: null }
});

const AgentsJob = model("AgentsJob", schema);

export default AgentsJob;

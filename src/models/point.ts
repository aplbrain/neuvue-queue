import { model, Schema } from "mongoose";

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
    resolution: { type: Number, default: 0}
    created: { type: Number, required: true, min: 0 },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    namespace: { type: String, required: true },
    submitted: { type: Number, default: Date.now, min: 0 },
    type: { type: String, required: true }
});

const Point = model("Point", schema);

export default Point;

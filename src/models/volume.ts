import { model, Schema } from "mongoose";

const schema = new Schema({
    active: { type: Boolean, default: true },
    author: { type: String, required: true },
    bounds: {
        required: true,
        type: [[Number]],
        validate: {
            validator(value: number[][]) {
                return value.length === 2 && value[0].length === 3 && value[1].length === 3;
            },
        },
    },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
    name: { type: String, required: true, index: true },
    namespace: { type: String, required: true },
    resolution: { type: Number, min: 0, required: true },
    uri: { type: String, required: true },
});

const Volume = model("Volume", schema);

export default Volume;

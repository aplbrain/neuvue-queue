import { Schema } from "mongoose";

const artifact = new Schema({
    active: { type: Boolean, default: true },
    type: { type: String, required: true },
    zslice: { type: Number, required: true, min: 0 },
});

export default artifact;

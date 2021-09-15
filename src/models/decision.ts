import { Schema } from "mongoose";

const decision = new Schema({
    active: { type: Boolean, default: true },
    author: { type: String, required: true, minlength: 1 },
    date: { type: Number, default: Date.now, min: 0 },
    decision: { type: String, required: true, enum: ["yes", "no", "maybe"] },
});

export default decision;

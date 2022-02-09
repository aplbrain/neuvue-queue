import { model, Schema } from "mongoose";

const schema = new Schema({
    active: { type: Boolean, default: true },
    submitted: { type: Number, default: Date.now, min: 0 },
    code: { type: String, required: true }
});

const auth = model("Auth", schema);

export default auth;

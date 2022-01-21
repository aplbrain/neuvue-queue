import { model, Schema } from "mongoose";

// Neuroglancer saves differ stack in viewer.differ.stack
// Contains all information about state changes during a single session
// Here we save them for downstream analysis

const schema = new Schema({
  active: {type: Boolean, default: true},
  task_id: {type: Schema.Types.ObjectId, ref: "Task", required: true},
  differ_stack: {type: [Map], required: true}
})

const DifferStack = model("DifferStack", schema);

export default DifferStack;
import { model, Schema } from "mongoose";

// A task patch is a single action that a user makes while completing a task in ngl
// Examples include moving the view and adding a point
// Ngl saves task patches in viewer.differ.stack
// Here we save them for analysis

const schema = new Schema({
  active: {type: Boolean, default: true},
  task_id: {type: Schema.Types.ObjectId, ref: "Task", required: true},
  differ_stack: {type: [Map], required: true}
})

const DifferStack = model("DifferStack", schema);

export default DifferStack;
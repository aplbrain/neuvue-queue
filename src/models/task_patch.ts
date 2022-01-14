import { model, Schema } from "mongoose";

// A task patch is a single action that a user makes while completing a task in ngl
// Examples include moving the view and adding a point
// Ngl saves task patches in viewer.differ.stack
// Here we save them for analysis

const schema = new Schema({
  task_id: {type: Schema.Types.ObjectId, ref: "Task", required: true},
  assignee: {type: String, required: true},
  seg_id: {type: String, required: true},
  timestamp: {type: String, required: true},
  patch: {type: String, required: true}
})

const TaskPatch = model("TaskPatch", schema);

export default TaskPatch;
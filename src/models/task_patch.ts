import { model, Schema } from "mongoose";

const schema = new Schema({
  task_id: {type: Schema.Types.ObjectId, ref: "Task", required: true},
  assignee: {type: String, required: true},
  seg_id: {type: String, required: true},
  timestamp: {type: String, required: true},
  patch: {type: String, required: true}
})

const TaskPatch = model("TaskPatch", schema);

export default TaskPatch;
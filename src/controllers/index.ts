import _ from "lodash/fp";
import { Server } from "restify";

import models from "../models";
import Controller from "./controller";
import * as mixins from "./mixins";
import PointController, { PointControllerOptions } from "./point";
import TaskController, { TaskControllerOptions } from "./task";

export interface NeuvueQueueControllerOptions {
    point?: PointControllerOptions;
    task?: TaskControllerOptions
}

function attach(server: Server, options?: NeuvueQueueControllerOptions): void {
    const points = new PointController(models.Point);
    const tasks = new TaskController(models.Task);
    points.attachTo("/points", server, _.get("point", options))
    tasks.attachTo("/tasks", server, _.get("task", options))
}

export default {
    Controller,
    PointController,
    TaskController,
    attach,
    mixins,
};

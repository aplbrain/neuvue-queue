import _ from "lodash/fp";
import { Server } from "restify";

import models from "../models";
import Controller from "./controller";
import * as mixins from "./mixins";
import PointController, { PointControllerOptions } from "./point";
import TaskController, { TaskControllerOptions } from "./task";
import DifferStackController, { DifferStackControllerOptions } from "./differ_stack";
import AgentsJobController, { AgentsJobControllerOptions } from "./agents_job";

export interface NeuvueQueueControllerOptions {
    point?: PointControllerOptions;
    task?: TaskControllerOptions;
    differ_stack?: DifferStackControllerOptions;
    agents_job?: AgentsJobControllerOptions;
}

function attach(server: Server, options?: NeuvueQueueControllerOptions): void {
    const points = new PointController(models.Point);
    const tasks = new TaskController(models.Task);
    const differ_stack = new DifferStackController(models.DifferStack);
    const agents_job = new AgentsJobController(models.AgentsJob);
    points.attachTo("/points", server, _.get("point", options));
    tasks.attachTo("/tasks", server, _.get("task", options));
    differ_stack.attachTo("/differstacks", server, _.get("differstack", options));
    agents_job.attachTo("/agents", server, _.get("agentsjob", options));
}

export default {
    Controller,
    PointController,
    TaskController,
    DifferStackController,
    attach,
    mixins,
};

import _ from "lodash/fp";
import { Server } from "restify";

import models from "../models";
import Controller from "./controller";
import GraphController, { GraphControllerOptions } from "./graph";
import * as mixins from "./mixins";
import NodeController, { NodeControllerOptions } from "./node";
import QuestionController, { QuestionControllerOptions } from "./question";
import VolumeController, { VolumeControllerOptions } from "./volume";
import PointController, { PointControllerOptions } from "./point";
import TaskController, { TaskControllerOptions } from "./task";

export interface ColocardControllerOptions {
    graph?: GraphControllerOptions;
    node?: NodeControllerOptions;
    question?: QuestionControllerOptions;
    volume?: VolumeControllerOptions;
    point?: PointControllerOptions;
    task?: TaskControllerOptions
}

function attach(server: Server, options?: ColocardControllerOptions): void {
    const graphs = new GraphController(models.Graph);
    const nodes = new NodeController(models.Node);
    const questions = new QuestionController(models.Question);
    const volumes = new VolumeController(models.Volume);
    const points = new PointController(models.Point);
    const tasks = new TaskController(models.Task);

    graphs.attachTo("/graphs", server, _.get("graph", options));
    nodes.attachTo("/nodes", server, _.get("node", options));
    questions.attachTo("/questions", server, _.get("question", options));
    volumes.attachTo("/volumes", server, _.get("volume", options));
    points.attachTo("/points", server, _.get("point", options))
    tasks.attachTo("/tasks", server, _.get("task", options))
}

export default {
    Controller,
    GraphController,
    NodeController,
    QuestionController,
    VolumeController,
    PointController,
    TaskController,
    attach,
    mixins,
};

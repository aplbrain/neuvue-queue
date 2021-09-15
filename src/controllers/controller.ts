import { Server } from "restify";

export default abstract class Controller {
    public abstract attachTo(root: string, server: Server): void;
}

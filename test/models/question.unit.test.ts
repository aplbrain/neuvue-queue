/* tslint:disable:no-unused-expression */

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import _ from "lodash/fp";
import { ObjectID } from "mongodb";

import Question from "../../src/models/question";

chai.use(chaiAsPromised);

const expect = chai.expect;

describe("Question", () => {
    let prototype: { [key: string]: any };

    beforeEach(() => {
        prototype = {
            active: true,
            assignee: "foo",
            author: "bar",
            closed: null,
            created: 0,
            instructions: {},
            metadata: {},
            namespace: "namespace",
            opened: null,
            priority: 0,
            status: "pending",
            volume: (new ObjectID()).toHexString(),
        };
    });

    it("should validate successfully without including the active field", async () => {
        const inst = new Question(_.omit("active", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().active).to.exist;
    });

    it("should require the assignee field", async () => {
        const inst = new Question(_.omit("assignee", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the author field", async () => {
        const inst = new Question(_.omit("author", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should validate successfully without including the closed field", async () => {
        const inst = new Question(_.omit("closed", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().closed).to.not.be.undefined;
    });

    it("should require the closed field to be 0 or greater", async () => {
        let inst = new Question(
            Object.assign({}, prototype, {
                closed: -1,
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Question(
            Object.assign({}, prototype, {
                closed: 0,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Question(
            Object.assign({}, prototype, {
                closed: 1,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should validate successfully without including the created field", async () => {
        const inst = new Question(_.omit("created", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().created).to.not.be.undefined;
    });

    it("should require the created field to be 0 or greater", async () => {
        let inst = new Question(
            Object.assign({}, prototype, {
                created: -1,
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Question(
            Object.assign({}, prototype, {
                created: 0,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Question(
            Object.assign({}, prototype, {
                created: 1,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should require the instructions field", async () => {
        const inst = new Question(_.omit("instructions", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should allow instructions to store arbitrary key-value pairs", async () => {
        const inst = new Question(
            Object.assign({}, prototype, {
                instructions: {
                    key1: {},
                    key2: [1, 2, 3],
                    key3: "foo",
                    key4: true,
                },
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should validate successfully without including a metadata field", async () => {
        const inst = new Question(_.omit("metadata", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().metadata).to.exist;
    });

    it("should allow metadata to store arbitrary key-value pairs", async () => {
        const inst = new Question(
            Object.assign({}, prototype, {
                metadata: {
                    key1: {},
                    key2: [1, 2, 3],
                    key3: "foo",
                    key4: true,
                },
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should require the namespace field", async () => {
        const inst = new Question(_.omit("namespace", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should validate successfully without including the opened field", async () => {
        const inst = new Question(_.omit("opened", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().opened).to.not.be.undefined;
    });

    it("should require the opened field to be 0 or greater", async () => {
        let inst = new Question(
            Object.assign({}, prototype, {
                opened: -1,
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Question(
            Object.assign({}, prototype, {
                opened: 0,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Question(
            Object.assign({}, prototype, {
                opened: 1,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should require the priority field", async () => {
        const inst = new Question(_.omit("priority", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the priority field to be 0 or greater", async () => {
        let inst = new Question(
            Object.assign({}, prototype, {
                priority: -1,
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Question(
            Object.assign({}, prototype, {
                priority: 0,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Question(
            Object.assign({}, prototype, {
                priority: 1,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should validate successfully without including the status field", async () => {
        const inst = new Question(_.omit("status", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().status).to.equal("pending");
    });

    it("should require the status field to be \"complete\", \"errored\", \"open\", or \"pending\"", async () => {
        for (const status of ["complete", "errored", "open", "pending"]) {
            const inst = new Question(
                Object.assign({}, prototype, {
                    status,
                }),
            );
            await expect(inst.validate()).to.be.fulfilled;
        }

        const inst = new Question(
            Object.assign({}, prototype, {
                status: "jm,",
            }),
        );
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the volume field", async () => {
        const inst = new Question(_.omit("volume", prototype));
        await expect(inst.validate()).to.be.rejected;
    });
});

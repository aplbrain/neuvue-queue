/* tslint:disable:no-unused-expression */

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import _ from "lodash/fp";
import { ObjectID } from "mongodb";

import Node from "../../src/models/node";

chai.use(chaiAsPromised);

const expect = chai.expect;

describe("Node", () => {
    let prototype: { [key: string]: any };

    beforeEach(() => {
        prototype = {
            active: true,
            author: "foo",
            coordinate: [0, 0, 0],
            created: 0,
            decisions: [],
            metadata: {},
            namespace: "namespace",
            submitted: 0,
            type: "node",
            volume: (new ObjectID()).toHexString(),
        };
    });

    it("should validate successfully without including the active field", async () => {
        const inst = new Node(_.omit("active", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().active).to.exist;
    });

    it("should require the author field", async () => {
        const inst = new Node(_.omit("author", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the coordinate field", async () => {
        const inst = new Node(_.omit("coordinate", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the coordinate should be an array of length 3", async () => {
        let inst = new Node(
            Object.assign({}, prototype, {
                coordinate: [10, 10, 10],
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Node(
            Object.assign({}, prototype, {
                coordinate: [0, 0],
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Node(
            Object.assign({}, prototype, {
                coordinate: [
                    [0, 0, 0],
                    [1, 1, 1],
                ],
            }),
        );
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the created field", async () => {
        const inst = new Node(_.omit("created", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the created field to be 0 or greater", async () => {
        let inst = new Node(
            Object.assign({}, prototype, {
                created: -1,
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Node(
            Object.assign({}, prototype, {
                created: 0,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Node(
            Object.assign({}, prototype, {
                created: 1,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should validate successfully without including the decisions field", async () => {
        const inst = new Node(_.omit("decisions", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().decisions).to.exist;
    });

    it("should validate successfully without including a metadata field", async () => {
        const inst = new Node(_.omit("metadata", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().metadata).to.exist;
    });

    it("should allow metadata to store arbitrary key-value pairs", async () => {
        const inst = new Node(
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
        const inst = new Node(_.omit("namespace", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should validate successfully without including the submitted field", async () => {
        const inst = new Node(_.omit("submitted", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().submitted).to.exist;
    });

    it("should require the submitted field to be 0 or greater", async () => {
        let inst = new Node(
            Object.assign({}, prototype, {
                submitted: -1,
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Node(
            Object.assign({}, prototype, {
                submitted: 0,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Node(
            Object.assign({}, prototype, {
                submitted: 1,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should require the type field", async () => {
        const inst = new Node(_.omit("type", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the volume field", async () => {
        const inst = new Node(_.omit("volume", prototype));
        await expect(inst.validate()).to.be.rejected;
    });
});

/* tslint:disable:no-unused-expression */

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import _ from "lodash/fp";
import { ObjectID } from "mongodb";

import Graph from "../../src/models/graph";

chai.use(chaiAsPromised);

const expect = chai.expect;

describe("Graph", () => {
    let prototype: { [key: string]: any };

    beforeEach(() => {
        prototype = {
            active: true,
            author: "test",
            metadata: {},
            namespace: "namespace",
            parent: null,
            structure: {
                directed: false,
                graph: {},
                links: [ { source: 1, dest: 2 }],
                multigraph: false,
                nodes: [ { id: 1 }, { id: 2 }],
            },
            submitted: 0,
            volume: (new ObjectID()).toHexString(),
        };
    });

    it("should validate successfully without including the active field", async () => {
        const inst = new Graph(_.omit("active", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().active).to.exist;
    });

    it("should require the author field", async () => {
        const inst = new Graph(_.omit("author", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should validate successfully without including a metadata field", async () => {
        const inst = new Graph(_.omit("metadata", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().metadata).to.exist;
    });

    it("should allow metadata to store arbitrary key-value pairs", async () => {
        const inst = new Graph(
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

    it("should validate successfully without including a parent field", async () => {
        const inst = new Graph(_.omit("parent", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().parent).to.not.be.undefined;
    });

    it("should require the structure field", async () => {
        const inst = new Graph(_.omit("structure", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should validate successfully without including the submitted field", async () => {
        const inst = new Graph(_.omit("submitted", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().submitted).to.exist;
    });

    it("should require the submitted field to be 0 or greater", async () => {
        let inst = new Graph(
            Object.assign({}, prototype, {
                submitted: -1,
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Graph(
            Object.assign({}, prototype, {
                submitted: 0,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Graph(
            Object.assign({}, prototype, {
                submitted: 1,
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;
    });

    it("should require the volume field", async () => {
        const inst = new Graph(_.omit("volume", prototype));
        await expect(inst.validate()).to.be.rejected;
    });
});

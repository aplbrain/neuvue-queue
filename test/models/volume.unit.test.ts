
/* tslint:disable:no-unused-expression */

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import _ from "lodash/fp";

import Volume from "../../src/models/volume";

chai.use(chaiAsPromised);

const expect = chai.expect;

describe("Volume", () => {
    let prototype: { [key: string]: any };

    beforeEach(() => {
        prototype = {
            active: true,
            author: "test",
            bounds: [
                [0, 0, 0],
                [1, 1, 1],
            ],
            metadata: {},
            name: "foo",
            namespace: "bar",
            resolution: 0,
            uri: "app://uri",
        };
    });

    it("should validate successfully without including the active field", async () => {
        const inst = new Volume(_.omit("active", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().active).to.exist;
    });

    it("should require the author field", async () => {
        const inst = new Volume(_.omit("author", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the bounds field", async () => {
        const inst = new Volume(_.omit("bounds", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require that the bounds field be a 2x3 2D array", async () => {
        let inst = new Volume(
            Object.assign({}, prototype, {
                bounds: [
                    [0, 0, 0],
                    [1, 1, 1],
                ],
            }),
        );
        await expect(inst.validate()).to.be.fulfilled;

        inst = new Volume(
            Object.assign({}, prototype, {
                bounds: [
                    [0, 0, 0],
                    [1, 1, 1],
                    [2, 2, 2],
                ],
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Volume(
            Object.assign({}, prototype, {
                bounds: [
                    [0, 0, 0],
                    [1, 1, 1, 1],
                ],
            }),
        );
        await expect(inst.validate()).to.be.rejected;

        inst = new Volume(
            Object.assign({}, prototype, {
                bounds: [],
            }),
        );
        await expect(inst.validate()).to.be.rejected;
    });

    it("should validate successfully without including a metadata field", async () => {
        const inst = new Volume(_.omit("metadata", prototype));
        await expect(inst.validate()).to.be.fulfilled;
        expect(inst.toObject().metadata).to.exist;
    });

    it("should allow metadata to store arbitrary key-value pairs", async () => {
        const inst = new Volume(
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

    it("should require the name field", async () => {
        const inst = new Volume(_.omit("name", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the namespace field", async () => {
        const inst = new Volume(_.omit("namespace", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the resolution field", async () => {
        const inst = new Volume(_.omit("resolution", prototype));
        await expect(inst.validate()).to.be.rejected;
    });

    it("should require the uri field", async () => {
        const inst = new Volume(_.omit("uri", prototype));
        await expect(inst.validate()).to.be.rejected;
    });
});

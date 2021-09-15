import { expect } from "chai";

import createMongoUri from "../../src/utils/mongo-uri";

describe("MongoDB URI creation", () => {
    describe("createMongoUri", () => {
        const host = "localhost";
        const port = 5000;
        const host2 = "127.0.0.1";
        const port2 = 5001;
        const database = "dbname";
        it("should create a properly formatted uri given a host, port, and database", () => {
            const expected = `mongodb://${host}:${port}/${database}`;
            expect(createMongoUri(host, port, database)).to.equal(expected);
        });

        it("should be able to handle multiple hosts and ports", () => {
            const expected = `mongodb://${host}:${port},${host2}:${port2}/${database}`;
            expect(createMongoUri([host, host2], [port, port2], database)).to.equal(expected);
        });

        it("should be able to handle multiple hosts and a single port", () => {
            const expected = `mongodb://${host}:${port},${host2}:${port}/${database}`;
            expect(createMongoUri([host, host2], port, database)).to.equal(expected);
        });

        it("should error if there are more ports than hosts", () => {
            expect(() => createMongoUri(host, [port, port2], database)).to.throw();
        });

        it("should error if there are multiple hosts and ports, but in unequal numbers", () => {
            expect(() => createMongoUri([host, host2], [port, port2, port], database)).to.throw();
            expect(() => createMongoUri([host, host2, host, host2], [port, port2], database)).to.throw();
        });
    });
});

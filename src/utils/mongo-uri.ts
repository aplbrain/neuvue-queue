import _ from "lodash/fp";

export default function createMongoUri(host: string | string[], port: number | number[], database: string): string {
    if (!Array.isArray(host)) {
        host = Array.of(host);
    }
    if (!Array.isArray(port)) {
        port = Array.of(port);
    }

    if (host.length === 0) {
        throw new Error("host must have a length of at least one");
    }
    if (port.length === 0) {
        throw new Error("port must have a length of at least one");
    }

    // Requirements: either the number of hosts equals the number of ports
    // or there is at least one host and a single port.
    if (host.length !== port.length) {
        if (host.length === 1 || port.length > 1) {
            throw new Error("number of hosts either must equal the number of ports, " +
                            "or there can only be a single port");
        }
        port = _.flatten(_.times(_.constant(port), host.length));
    }

    const addresses = _.map(([h, p]) => `${h}:${p}`, _.zip(host, port)).join(",");
    return `mongodb://${addresses}/${database}`;
}

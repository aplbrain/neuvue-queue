/* tslint:disable:no-unused-expression */

import { expect } from "chai";

import mix from "../../src/utils/mix";

describe("Class Mixins", () => {
    describe("mix", () => {
        it("should enable one or more mixins to be added", () => {
            const Mixin1 = (superclass: any) => class extends superclass {
                public foo() {
                    return "foo";
                }
            };

            const Mixin2 = (superclass: any) => class extends superclass {
                public bar() {
                    return "bar";
                }
            };

            class S {
                public baz() {
                    return "baz";
                }
            }

            class C extends mix(S).with(Mixin1, Mixin2) {
                public go() {
                    return "go";
                }
            }

            const c = new C();
            expect(c.foo).to.exist;
            expect(c.foo()).to.equal("foo");
            expect(c.bar).to.exist;
            expect(c.bar()).to.equal("bar");
            expect(c.baz).to.exist;
            expect(c.baz()).to.equal("baz");
        });

        it("should maintain a class hierarchy", () => {
            const Mixin1 = (superclass: any) => class extends superclass {
                public foo() {
                    const a = super.foo();
                    a.push(1);
                    return a;
                }
            };

            const Mixin2 = (superclass: any) => class extends superclass {
                public foo() {
                    const a = super.foo();
                    a.push(2);
                    return a;
                }
            };

            class S {
                public foo() {
                    return [0];
                }
            }

            class C extends mix(S).with(Mixin1, Mixin2) {
                public foo() {
                    const a = super.foo();
                    a.push(3);
                    return a;
                }
            }

            const c = new C();
            expect(c.foo()).to.have.ordered.members([0, 1, 2, 3]).and.to.have.length(4);
        });
    });
});

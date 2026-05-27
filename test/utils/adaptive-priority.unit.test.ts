import { expect } from "chai";

import {
    applyAdaptivePriorityToTaskPayload,
    calculateAdaptivePriority,
    mergeAdaptivePriority,
} from "../../src/utils/adaptive-priority";
import Task from "../../src/models/task";

describe("Adaptive priority", () => {
    describe("calculateAdaptivePriority", () => {
        it("should compute a numeric weighted sum", () => {
            const result = calculateAdaptivePriority({
                priors: { confidence: 2, age: 3 },
                weights: { confidence: 4, age: 5 },
            }, 1000);

            expect(result.score).to.equal(23);
            expect(result.contributions).to.deep.equal({ confidence: 8, age: 15 });
            expect(result.updated).to.equal(1000);
        });

        it("should compute categorical contributions", () => {
            const result = calculateAdaptivePriority({
                categories: { type: { merge: 7, split: 2 } },
                priors: { type: "merge" },
                weights: { type: 3 },
            });

            expect(result.score).to.equal(21);
            expect(result.contributions).to.deep.equal({ type: 21 });
        });

        it("should compute mixed priors with bias", () => {
            const result = calculateAdaptivePriority({
                bias: 10,
                categories: { source: { model: 4 } },
                priors: { confidence: 2, source: "model" },
                weights: { confidence: 3, source: 2 },
            });

            expect(result.score).to.equal(24);
            expect(result.contributions).to.deep.equal({ confidence: 6, source: 8 });
        });

        it("should clamp scores", () => {
            const high = calculateAdaptivePriority({
                max: 5,
                priors: { score: 10 },
            });
            const low = calculateAdaptivePriority({
                bias: -10,
                min: 3,
                priors: { score: 1 },
            });

            expect(high.score).to.equal(5);
            expect(low.score).to.equal(3);
        });

        it("should reject unsupported prior values", () => {
            expect(() => calculateAdaptivePriority({
                priors: { bad: ["nope"] as any },
            })).to.throw("adaptive_priority.priors.bad must be a finite number or string");
        });

        it("should reject missing categorical lookup values", () => {
            expect(() => calculateAdaptivePriority({
                categories: { type: { merge: 1 } },
                priors: { type: "split" },
            })).to.throw("adaptive_priority.categories.type.split must be a finite number");
        });

        it("should reject bad weights", () => {
            expect(() => calculateAdaptivePriority({
                priors: { score: 1 },
                weights: { score: "heavy" as any },
            })).to.throw("adaptive_priority.weights.score must be a finite number");
        });
    });

    describe("task payloads", () => {
        it("should preserve non-adaptive scalar priority tasks", async () => {
            const payload = applyAdaptivePriorityToTaskPayload({
                assignee: "proofreader",
                author: "author",
                instructions: {},
                namespace: "public",
                priority: 8,
            });
            const task = new Task(payload);

            await task.validate();
            expect(task.get("priority")).to.equal(8);
            expect(task.get("adaptive_priority").enabled).to.equal(false);
        });

        it("should compute priority before adaptive task validation", async () => {
            const payload = applyAdaptivePriorityToTaskPayload({
                adaptive_priority: {
                    enabled: true,
                    priors: { confidence: 4 },
                    weights: { confidence: 2 },
                },
                assignee: "proofreader",
                author: "author",
                instructions: {},
                namespace: "public",
            }, 1000);
            const task = new Task(payload);

            await task.validate();
            expect(task.get("priority")).to.equal(8);
            expect(task.get("adaptive_priority").score).to.equal(8);
            expect(task.get("adaptive_priority").updated).to.equal(1000);
        });

        it("should merge adaptive priority patches shallowly", () => {
            const merged = mergeAdaptivePriority({
                enabled: true,
                priors: { confidence: 1 },
                provenance: { source: "seed" },
                weights: { confidence: 2 },
            }, {
                priors: { age: 3 },
                provenance: { client: "tool" },
            });

            expect(merged.priors).to.deep.equal({ confidence: 1, age: 3 });
            expect(merged.weights).to.deep.equal({ confidence: 2 });
            expect(merged.provenance).to.deep.equal({ source: "seed", client: "tool" });
        });

        it("should allow manual scalar priority while retaining adaptive fields", async () => {
            const payload = applyAdaptivePriorityToTaskPayload({
                adaptive_priority: {
                    enabled: true,
                    priors: { confidence: 4 },
                },
                assignee: "proofreader",
                author: "author",
                instructions: {},
                namespace: "public",
            });
            const task = new Task(payload);

            task.set("priority", 99);
            await task.validate();
            expect(task.get("priority")).to.equal(99);
            expect(task.get("adaptive_priority").enabled).to.equal(true);
        });
    });
});

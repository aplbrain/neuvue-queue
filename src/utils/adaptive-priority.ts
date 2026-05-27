export type AdaptivePriorValue = number | string;

export interface AdaptivePriority {
    enabled?: boolean;
    strategy?: "weighted_sum_v1";
    priors?: { [key: string]: AdaptivePriorValue };
    weights?: { [key: string]: number };
    categories?: { [key: string]: { [key: string]: number } };
    bias?: number;
    min?: number;
    max?: number | null;
    score?: number | null;
    contributions?: { [key: string]: number };
    provenance?: { [key: string]: any };
    updated?: number | null;
}

export interface AdaptivePriorityComputation {
    score: number;
    contributions: { [key: string]: number };
    updated: number;
}

const STRATEGY = "weighted_sum_v1";

function isPlainObject(value: any): value is { [key: string]: any } {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: any): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function objectFromMapLike(value: any): any {
    if (value === undefined) {
        return {};
    }
    if (value === null) {
        return value;
    }
    if (value instanceof Map) {
        const obj: { [key: string]: any } = {};
        value.forEach((mapValue: any, key: string) => {
            obj[key] = objectFromMapLike(mapValue);
        });
        return obj;
    }
    if (typeof value.toObject === "function") {
        return objectFromMapLike(value.toObject());
    }
    if (isPlainObject(value)) {
        const obj: { [key: string]: any } = {};
        Object.keys(value).forEach((key) => {
            obj[key] = objectFromMapLike(value[key]);
        });
        return obj;
    }
    return value;
}

function validateAdaptivePriorityConfig(config: AdaptivePriority): void {
    if (config.strategy && config.strategy !== STRATEGY) {
        throw new Error(`adaptive_priority.strategy must be ${STRATEGY}`);
    }
    if (config.bias !== undefined && !isFiniteNumber(config.bias)) {
        throw new Error("adaptive_priority.bias must be a finite number");
    }
    if (config.min !== undefined && !isFiniteNumber(config.min)) {
        throw new Error("adaptive_priority.min must be a finite number");
    }
    if (config.max !== undefined && config.max !== null && !isFiniteNumber(config.max)) {
        throw new Error("adaptive_priority.max must be null or a finite number");
    }
    if (config.max !== undefined && config.max !== null && (config.min || 0) > config.max) {
        throw new Error("adaptive_priority.min cannot be greater than adaptive_priority.max");
    }
    if (config.priors !== undefined && !isPlainObject(config.priors)) {
        throw new Error("adaptive_priority.priors must be an object");
    }
    if (config.weights !== undefined && !isPlainObject(config.weights)) {
        throw new Error("adaptive_priority.weights must be an object");
    }
    if (config.categories !== undefined && !isPlainObject(config.categories)) {
        throw new Error("adaptive_priority.categories must be an object");
    }
    Object.keys(config.priors || {}).forEach((key) => {
        const prior = (config.priors as { [key: string]: any })[key];
        if (!isFiniteNumber(prior) && typeof prior !== "string") {
            throw new Error(`adaptive_priority.priors.${key} must be a finite number or string`);
        }
    });
    Object.keys(config.weights || {}).forEach((key) => {
        if (!isFiniteNumber((config.weights as { [key: string]: any })[key])) {
            throw new Error(`adaptive_priority.weights.${key} must be a finite number`);
        }
    });
}

export function normalizeAdaptivePriority(raw?: any): AdaptivePriority {
    if (
        raw !== null
        && raw !== undefined
        && !isPlainObject(raw)
        && !(raw instanceof Map)
        && typeof raw.toObject !== "function"
    ) {
        throw new Error("adaptive_priority must be an object");
    }
    const config = objectFromMapLike(raw === null || raw === undefined ? {} : raw) as AdaptivePriority;
    const normalized: AdaptivePriority = {
        bias: 0,
        categories: {},
        contributions: {},
        enabled: false,
        max: null,
        min: 0,
        priors: {},
        provenance: {},
        score: null,
        strategy: STRATEGY,
        updated: null,
        weights: {},
        ...config,
    };
    normalized.priors = objectFromMapLike(normalized.priors);
    normalized.weights = objectFromMapLike(normalized.weights);
    normalized.categories = objectFromMapLike(normalized.categories);
    normalized.contributions = objectFromMapLike(normalized.contributions);
    normalized.provenance = objectFromMapLike(normalized.provenance);
    validateAdaptivePriorityConfig(normalized);
    return normalized;
}

export function calculateAdaptivePriority(
    raw: AdaptivePriority,
    now: number = Date.now(),
): AdaptivePriorityComputation {
    const config = normalizeAdaptivePriority(raw);
    const priors = config.priors || {};
    const weights = config.weights || {};
    const categories = config.categories || {};
    const contributions: { [key: string]: number } = {};
    let score = config.bias || 0;

    Object.keys(priors).forEach((key) => {
        const prior = priors[key];
        const weight = weights[key] === undefined ? 1 : weights[key];
        let priorValue: number;
        if (isFiniteNumber(prior)) {
            priorValue = prior;
        } else {
            const lookup = categories[key];
            if (!lookup || !isFiniteNumber(lookup[prior])) {
                throw new Error(`adaptive_priority.categories.${key}.${prior} must be a finite number`);
            }
            priorValue = lookup[prior];
        }
        const contribution = priorValue * weight;
        contributions[key] = contribution;
        score += contribution;
    });

    const min = config.min === undefined ? 0 : config.min;
    const max = config.max === undefined ? null : config.max;
    if (max !== null && min > max) {
        throw new Error("adaptive_priority.min cannot be greater than adaptive_priority.max");
    }
    score = Math.max(min, score);
    if (max !== null) {
        score = Math.min(max, score);
    }
    if (score < 0) {
        throw new Error("adaptive priority score must be >= 0");
    }

    return { contributions, score, updated: now };
}

export function mergeAdaptivePriority(existing: any, patch: any): AdaptivePriority {
    const current = normalizeAdaptivePriority(existing);
    const incoming = objectFromMapLike(patch) as AdaptivePriority;
    if (!isPlainObject(incoming)) {
        throw new Error("adaptive_priority must be an object");
    }

    return normalizeAdaptivePriority({
        ...current,
        ...incoming,
        categories: {
            ...(current.categories || {}),
            ...(incoming.categories || {}),
        },
        priors: {
            ...(current.priors || {}),
            ...(incoming.priors || {}),
        },
        provenance: {
            ...(current.provenance || {}),
            ...(incoming.provenance || {}),
        },
        weights: {
            ...(current.weights || {}),
            ...(incoming.weights || {}),
        },
    });
}

export function applyAdaptivePriorityToTaskPayload(task: any, now: number = Date.now()): any {
    const adaptivePriority = normalizeAdaptivePriority(task.adaptive_priority);
    if (!adaptivePriority.enabled) {
        return {
            ...task,
            adaptive_priority: adaptivePriority,
        };
    }

    const computation = calculateAdaptivePriority(adaptivePriority, now);
    const computedAdaptivePriority = {
        ...adaptivePriority,
        contributions: computation.contributions,
        score: computation.score,
        updated: computation.updated,
    };
    return {
        ...task,
        adaptive_priority: computedAdaptivePriority,
        priority: computation.score,
    };
}

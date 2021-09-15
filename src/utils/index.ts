import * as handlers from "./handlers";
import * as middleware from "./middleware";
import mix, { MixinBuilder } from "./mix";
import createMongoUri from "./mongo-uri";
import * as serializers from "./serializers";

export default {
    MixinBuilder,
    createMongoUri,
    handlers,
    middleware,
    mix,
    serializers,
};

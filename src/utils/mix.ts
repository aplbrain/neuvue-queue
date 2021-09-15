export class MixinBuilder {
    private superclass: any;
    constructor(superclass: any) {
        this.superclass = superclass;
    }

    public with(...mixins: Array<(superclass: any) => any>): any {
        return mixins.reduce((c, mixin) => mixin(c), this.superclass);
    }
}

export default function mix(superclass: any): MixinBuilder {
    return new MixinBuilder(superclass);
}

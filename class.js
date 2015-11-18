Class = {
    init: Object,
    extend: function(args) {
        var init = args.init;
        if(init.name == "") throw new Error("Init functions must be named");
        init.prototype = Object.create(this.prototype || Object.prototype);
        init.prototype.constructor = init;
        init.prototype.base = this;
        init.extend = Class.extend;
        for(var prop in args) {
            init.prototype[prop] = args[prop];
            init[prop] = args[prop];
        }
        init.prototype["getType"] = function() {
            return init;
        }
        return init;
    }
}
Array.prototype.py = function(i) {
    var ai = i < 0 ? i + this.length : (i >= this.length ? i - this.length : i);
    return this[ai];
}
function range(size) {
    return Array.apply(null, Array(size)).map(function (_, i) {return i;});
}
CurveCache = Class.extend({
    init: (function CurveCache(numSamples) {
        this.numSamples = numSamples || 30;
        this.alpha = 0.5;
        this.control_points = [];
        this.samples = [];
    }),
    resample: function(control_points) {
        this.control_points = control_points;
        var self = this;
        this.samples = range((self.numSamples) * control_points.length).map(function(v) {
            var f = self.eval(v / self.numSamples);
            return f;
        });
    },
    eval: function(u) {
        var self = this;
        var i = Math.floor(u);
        var segment = [-1,0,1,2].map(function(v) {
            return self.control_points.py(v + i);
        });
        var ti = range(4);
        for(var j = 1; j < 4; j++) {
            ti[j] = Math.pow((segment[j].length == 2 ? vec2 : vec3).dist(segment[j - 1], segment[j]), this.alpha) + ti[j - 1];
        }
        var t = (u - i) * (ti[2] - ti[1]) + ti[1];
        var A1 = self.WAT(ti[0], ti[1], t, segment[0], segment[1]);
        var A2 = self.WAT(ti[1], ti[2], t, segment[1], segment[2]);
        var A3 = self.WAT(ti[2], ti[3], t, segment[2], segment[3]);
        var B1 = self.WAT(ti[0], ti[2], t, A1, A2);
        var B2 = self.WAT(ti[1], ti[3], t, A2, A3);
        return self.WAT(ti[1], ti[2], t, B1, B2);
    },
    WAT: function(t0, t1, t, A, B) {
        var out = vec2.create();
        var tmp = vec2.create();
        vec2.scale(out, A, (t1-t)/(t1-t0));
        vec2.scale(tmp, B, (t-t0)/(t1-t0));
        vec2.add(out, tmp, out);
        return out;
    }
})
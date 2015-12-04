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
            var f = self.eval(v / self.numSamples / control_points.length);
            return f;
        });
        this.arc_length = this.samples.reduce(function(sum, point, i, samples) {
            if(i == 0) return sum;
            return vec2.dist(point, samples[i - 1]) + sum;
        }, 0);

        this.cumulative_length = [];
        var cum_length = 0;
        for(var i = 0; i < this.samples.length; i++) {
            if(i > 0)
                cum_length += vec2.dist(this.samples[i], this.samples[i - 1]);
            this.cumulative_length.push(cum_length / this.arc_length);
        }
    },
    eval: function(u) {
        var self = this;
        u *= self.control_points.length;
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
    },
    tangent_at_point: function(i) {
        var a = this.samples.py(i - 1);
        var b = this.samples.py(i);
        var c = this.samples.py(i + 1);
        var ab = vec2.create();
        vec2.sub(ab, b, a);
        var bc = vec2.create();
        vec2.sub(bc, c, b);
        vec2.add(bc, bc, ab);
        vec2.normalize(bc, bc);
        return bc;
    },
    tangent: function(u) {
        u = u * this.samples.length
        var i = Math.floor(u);
        var w = u - i;
        var prev = this.tangent_at_point(i);
        vec2.scale(prev, prev, (1 - w));
        var next = this.tangent_at_point(i + 1);
        vec2.scale(next, next, w);
        vec2.add(next, next, prev);
        return vec2.normalize(next, next);
    },
    normal: function(u) {
        var tan = this.tangent(u);
        tan = vec3.fromValues(tan[0], tan[1], 0);
        var out = vec3.create();
        vec3.cross(out, tan, [0,0,1]);
        return out;
    },
    arclenToU: function(s) {
        s = s % 1;
        if(s < 0) s += 1;
        var i;
        for(i = 0.0; i < this.cumulative_length.length && this.cumulative_length[i] < s; i++) { }
        var prev = this.cumulative_length.py(i - 1);
        var next = this.cumulative_length.py(i);
        var diff = next - prev;
        var w = (s - prev) / diff;
        return ((i) * w + (i - 1) * (1 - w)) / this.cumulative_length.length;
        return i / this.cumulative_length.length;
    }
})
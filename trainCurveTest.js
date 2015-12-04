/**
 * Created by gleicher on 11/6/15.
 */

/* 559 Train Sample Code
    Note: this is not complete. The actual guts of the project are in another file.
    This code will not run!
    However, it is provided to students so they can get a sense of how to
    use the DotWindow and TrainTimeController objects.
 */

// make a checkbox - put a label next to it (so it all goes into a div)
// note: this returns the checkbox - not the containing div
// this will add the DIV as a child of the thing passed as "appendTo"
function makeCheckBox(name, appendTo, callback) {
    var span = document.createElement("SPAN");
    var label = document.createTextNode(name);
    var button = document.createElement("INPUT");
    span.appendChild(button);
    span.appendChild(label);

    span.style.width = '150px';
    span.style.display = "inline-block";

    button.setAttribute("type", "checkbox");
    button.checked = false;
    if (callback) button.addEventListener("change",callback);

    if (appendTo) appendTo.appendChild(span);
    return button;
}

//
var cc = new CurveCache();
var ccl = new CurveCache();
var ccr = new CurveCache();
window.onload = function() {
    "use strict";
    var body = document.body;
    var width = 600;

    var canvas = document.createElement("canvas");
    canvas.setAttribute("width",width);
    canvas.setAttribute("height",width);
    canvas.style.border = "1px solid";
    body.appendChild(canvas);

    //
    // the important part: set up the two main things in the train
    var ttc = new TrainTimeController(width,body);
    var dw = new DotWindow(canvas, [ [100,300], [100,100], [300,100], [300,300]]);

    resample(dw.points);
    function resample(points) {
        cc.resample(points);
        points = range(points.length * 2).map(function(i) {
            return cc.eval(i / points.length / 2);
        })
        var lpoints = points.map(function(point, i) {
            var out = vec2.fromValues(point[0], point[1]);
            var normal = cc.normal(i / (points.length));
            vec2.scale(normal, normal, 10);
            vec2.add(out, out, normal);
            return out
        });
        var rpoints = points.map(function(point, i) {
            var out = vec2.fromValues(point[0], point[1]);
            var normal = cc.normal(i / (points.length));
            vec2.scale(normal, normal, -10);
            vec2.add(out, out, normal);
            return out
        });
        ccl.resample(lpoints);
        ccr.resample(rpoints);
    }

    function drawCurve(cc, ctx, normalOffset) {
        ctx.save();
        ctx.strokeStyle = "black";
        ctx.linewidth = 2;
        ctx.beginPath();
        var last = cc.samples.length-1;
        ctx.moveTo(cc.samples[last][0],cc.samples[last][1]);
        cc.samples.forEach(function (e, i) {
            if(normalOffset) {
                var point = vec2.fromValues(e[0], e[1]);
                var normal = cc.normal(i / (cc.samples.length));
                vec2.scale(normal, normal, normalOffset);
                vec2.add(point, point, normal);
                ctx.lineTo(point[0],point[1]);
            }
            else
                ctx.lineTo(e[0],e[1]);
        });
        ctx.stroke();
        ctx.restore();
    }

    // control panel
    // this sets up a control panel that has various things for alterning parameters
    var controls = document.createElement("div");
    controls.style.border = "1px solid black";
    controls.style.padding = "5px";
    controls.style.marginTop = "5px";
    controls.style.marginBottom = "5px";
    controls.style.display = "block";
    controls.style.width = (width-10) +"px";    // account for padding
    body.appendChild(controls);
    function cb() { dw.scheduleRedraw();}
    var drawTracks = makeCheckBox("Draw tracks",controls,cb);
    drawTracks.checked = true;
    var asCurves = makeCheckBox("Tracks as curves",controls,cb);
    asCurves.checked = true;
    var drawInnerCurve = makeCheckBox("Draw inner curve",controls,cb);

    // this wires the pieces together
    // when a dot is changed, recompute the curve (and make sure the timeline is right)
    // when the time changes, redraw (so the train moves)
    dw.onChange.push(function(dw) {resample(dw.points);});
    ttc.onchange.push(function() {dw.scheduleRedraw();});

    // this draws the train and track
    dw.userDraw.push(function(ctx,dotWindow) {
        if(drawInnerCurve.checked) 
            drawCurve(cc, ctx);
        if(drawTracks.checked) {
            if(asCurves.checked) {
                drawCurve(ccr, ctx);
                drawCurve(ccl, ctx);
            }
            else {
                drawCurve(cc, ctx, 10);
                drawCurve(cc, ctx, -10);
            }
        }
        var t = ttc.getTime();
        range(3).map(function(i) {
            var u = cc.arclenToU(t,true);
            var pos = cc.eval(u);
            var tan = cc.tangent(u);
            var angle = Math.atan2(tan[1], tan[0]);

            ctx.save();
            ctx.translate(pos[0],pos[1]);
            ctx.beginPath();
            ctx.rotate(angle);
            ctx.rect(-20,-12,40,24);
            ctx.fillStyle = "blue";
            ctx.fill();
            ctx.restore();


            t += 48 / cc.arc_length;
        });
    });
}
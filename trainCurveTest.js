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
    var ttc = new TrainTimeController(width,body,4);
    var dw = new DotWindow(canvas, [ [100,300], [100,100], [300,100], [300,300]]);

    cc.resample(dw.points);

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
    var arclen = makeCheckBox("ArcLength",controls,cb);
    var asDots = makeCheckBox("AsDots",controls,cb);

    // this wires the pieces together
    // when a dot is changed, recompute the curve (and make sure the timeline is right)
    // when the time changes, redraw (so the train moves)
    dw.onChange.push(function(dw) {cc.resample(dw.points); ttc.setMax(dw.points.length)});
    ttc.onchange.push(function() {dw.scheduleRedraw();});

    // this draws the train and track
    dw.userDraw.push(function(ctx,dotWindow) {
        if (asDots.checked) {
            cc.samples.forEach(function (e, i) {
                ctx.save();
                ctx.translate(e[0], e[1]);
                ctx.beginPath();
                ctx.rect(-2, -2, 4, 4);
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.restore();
            });
        } else {
            ctx.save();
            ctx.strokeStyle = "black";
            ctx.linewidth = 2;
            ctx.beginPath();
            var last = cc.samples.length-1;
            ctx.moveTo(cc.samples[last][0],cc.samples[last][1]);
            cc.samples.forEach(function (e, i) {
                ctx.lineTo(e[0],e[1]);
            });
            ctx.stroke();
            ctx.restore();
        }

        var t = ttc.getTime();
        var pos = cc.eval(arclen.checked ? cc.arclenToU(t,true) : t );

        ctx.save();
        ctx.translate(pos[0],pos[1]);
        ctx.beginPath();
        ctx.rect(-6,-6,12,12);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.restore();
    });
}
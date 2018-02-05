var targetControl = (function()
{
    var mElement;
    var mSvgElement;
    var mCurZoom = 1;
    
    // 0 : InteractionMode.Invalid;
    // 1 : InteractionMode.Mouse
    // 2 : InteractionMode.Touch
    // 3 : InteractionMode.Stylus
    var mCurInteractionMode=0;

    // 0 : MouseInteractionState.Invalid
    // 1 : MouseInteractionState.OutOfElement
    var mCurMouseInteractionState=0;

    // public
    var initialize = function(idOfCanvasElement, idOfSVGElement){
        var canvas = document.getElementById(idOfCanvasElement);
        var svg = document.getElementById(idOfSVGElement);
        mElement=canvas;
        mSvgElement=svg;
        setupEvents();
        var ctx = mElement.getContext("2d");
        ctx.setTransform(getCanvasWidth(), 0, 0, getCanvasHeight(), 0, 0);
        paintTarget(ctx);
    }

    // private
    var setupEvents=function(){
        mElement.addEventListener("mousedown",onMouseDownHandler);
        mElement.addEventListener("mouseup",onMouseUpHandler);
        mElement.addEventListener("mousemove",onMouseMoveHandler);
        mElement.addEventListener("mouseout",onMouseOutHandler);

        window.addEventListener("mouseup", onMouseUpWindow);
        window.addEventListener("mousemove", onMouseMoveWindow);
        window.addEventListener("keydown", onKeyDownWindow);

        mElement.addEventListener("touchstart",onTouchStart);
        mElement.addEventListener("touchmove",onTouchMove);
        mElement.addEventListener("touchend",onTouchEnd);
        mElement.addEventListener("ontouchcancel",onTouchCancel);

        mElement.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        }, true);

        // this prevents the "hold-visual" from appearing (works only on Edge, cf. https://stackoverflow.com/questions/46714590/how-to-remove-default-box-outline-animation-in-chrome-on-touchstart-hold?noredirect=1&lq=1)
        mElement.addEventListener("MSHoldVisual", function (e) {
            e.preventDefault();
        }, false);
    }

    var onMouseDownHandler=function(ev)
    {
        console.log("Down");
    }

    var onMouseUpHandler=function(ev)
    {
        console.log("Up");
    }

    var onMouseMoveHandler=function(ev)
    {
        console.log("Move");
    }

    var onMouseOutHandler=function(ev)
    {
        console.log("Out");
    }

    var onMouseUpWindow=function(ev)
    {
        console.log("Up (Window)");
    }

    var onMouseMoveWindow=function(ev)
    {
        console.log("Move (Window)");
    }

    var onKeyDownWindow=function(ev)
    {
        console.log("Keydown (Window)");
    }

    var onTouchStart=function(ev)
    {
        console.log("Touch start");
    }

    var onTouchMove=function(ev)
    {
        console.log("Touch move");
    }

    var onTouchEnd=function(ev)
    {
        console.log("Touch end");
    }

    var onTouchCancel=function(ev)
    {
        console.log("Touch cancel");
    }

    var getCanvasWidth=function() { return mElement.getCanvasWidth; }
    var getCanvasHeight=function() { return mElement.getCanvasHeight; }

    var paintTarget=function(ctx){
        var canvasInfo=new CanvasInfo(1,1);
        var targetSegments = getTargetSegments();

        for (var i = 0; i < targetSegments.length; ++i) {
            var s = targetSegments[i];
            var segmentEndRadius;
            if (i < targetSegments.length - 1) {
                segmentEndRadius = targetSegments[i + 1].radius;
            } else {
                segmentEndRadius = 0;
            }
            paintSegmentTs(ctx, canvasInfo, s.radius, s.radius - s.marginWidth, s.marginColor);
            paintSegmentTs(ctx, canvasInfo, s.radius - s.marginWidth, segmentEndRadius, s.segmentColor);
            //this.paintSegmentTs(ctx, canvasInfo, s.radius, s.radius - s.marginWidth, s.marginColor);
            //this.paintSegmentTs(ctx, canvasInfo, s.radius - s.marginWidth, segmentEndRadius, s.segmentColor);
        }
    }

    function rgbToHex(rgb)
    {
        var rgb = rgb[2] | (rgb[1] << 8) | (rgb[0] << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }

    var paintSegmentTs=function(ctx, canvasInfo, startRadius, endRadius, color)
    {
        ctx.beginPath();
        var startRadiusPx = startRadius * canvasInfo.radiusX;
        var endRadiusPx = endRadius * canvasInfo.radiusX;
        var middlePx = (startRadiusPx + endRadiusPx) / 2;
        ctx.arc(canvasInfo.centerX, canvasInfo.centerY, middlePx, 0, 2 * Math.PI);
        ctx.lineWidth = -endRadiusPx + startRadiusPx;
        ctx.strokeStyle = rgbToHex(color);
        ctx.stroke();
    }

    var getTargetSegments=function(){
        var defaultMarginWidth = 0.01 / 2;

        var WhiteSegment = [226, 216, 217];
        var BlackSegment = [54, 49, 53];
        var BlueSegment = [68, 173, 228];
        var RedSegment = [231, 37, 35];
        var RedSegmentText = [176, 127, 113];
        var GoldSegment = [251, 209, 3];
        var GoldSegmentText = [165, 135, 11];
        var WhiteSegmentText = [111, 106, 103];
        var BlackSegmentText = [181, 177, 174];
        var BlueSegmentText = [0, 56, 85];
        var Black =[0, 0, 0];
        var White = [255, 255, 255];
        return [
            new TargetSegment(1.0,
                defaultMarginWidth,
                "1",
                WhiteSegment,        /* Segment color */
                Black,               /* Margin color */
                WhiteSegmentText),   /* Text color */
            new TargetSegment(0.9,
                defaultMarginWidth,
                "2",
                WhiteSegment,
                Black,
                WhiteSegmentText),
            new TargetSegment(0.8,
                defaultMarginWidth,
                "3",
                BlackSegment,
                White,
                BlackSegmentText),
            new TargetSegment(0.7,
                defaultMarginWidth,
                "4",
                BlackSegment,
                White,
                BlackSegmentText),
            new TargetSegment(0.6,
                defaultMarginWidth,
                "5",
                BlueSegment,
                Black,
                BlueSegmentText),
            new TargetSegment(0.5,
                defaultMarginWidth,
                "6",
                BlueSegment,
                Black,
                BlueSegmentText),
            new TargetSegment(0.4,
                defaultMarginWidth,
                "7",
                RedSegment,
                Black,
                RedSegmentText),
            new TargetSegment(0.3,
                defaultMarginWidth,
                "8",
                RedSegment,
                Black,
                RedSegmentText),
            new TargetSegment(0.2,
                defaultMarginWidth,
                "9",
                GoldSegment,
                Black,
                GoldSegmentText),
            new TargetSegment(0.1,
                defaultMarginWidth,
                "10",
                GoldSegment,
                Black,
                GoldSegmentText)
        ]; 
    }

    var CanvasInfo=function(width,height){this.width=width;this.height=height;}

    var TargetSegment=function(radius,marginWidth,text,segmentColor,marginColor,textColor)
    {
        this.radius=radius;
        this.marginWidth=marginWidth;
        this.text=text;
        this.segmentColor=segmentColor;
        this.marginColor=marginColor;
        this.textColor=textColor;
    }

    return {
        initialize: initialize
    }
})();
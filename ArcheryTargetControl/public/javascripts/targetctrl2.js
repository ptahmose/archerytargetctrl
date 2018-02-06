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

    var mBackupElement;
    var mHitGroup;
    var mShotPositions;

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
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        mBackupElement = document.createElement("canvas");
        mBackupElement.width = getCanvasWidth();//this.canvasWidth;
        mBackupElement.height = getCanvasHeight();//this.canvasHeight;
        var ctxBackup = mBackupElement.getContext("2d");
        ctxBackup.drawImage(mElement, 0, 0, getCanvasWidth(), getCanvasHeight());

        insertHitsGroup();
        var h = [new Shot( 0.25, 0.25,6),new Shot(0.25, 0.75,7), new Shot( 0.75, 0.25,6), new Shot( 0.75,0.75,6),new Shot( 0.5, 0.5,10)];
        mShotPositions = h;
        drawHits(h);
    }

    // private
    var insertHitsGroup=function(){
        var group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        //group.setAttribute('transform', 'scale(1024,1024)');
        group.setAttribute('transform', 'scale(' +  getCanvasWidth() + ',' + getCanvasWidth() + ')');
        mHitGroup = group;
        mSvgElement.getElementById('hits').appendChild(group);
    }

    var drawHits=function(hitCoordinates){
        while (mHitGroup.firstChild) { mHitGroup.removeChild(mHitGroup.firstChild); }

        hitCoordinates.forEach((v) => {
            var hit = document.createElementNS("http://www.w3.org/2000/svg", 'use');
            hit.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#shape');
            hit.setAttribute('transform', 'translate(' + v.xNormalized.toString() + ',' + v.yNormalized.toString() + ') scale(0.1,0.1)');
            mHitGroup.appendChild(hit);
        });
    }

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

    var getCanvasWidth=function() { return mElement.width; }
    var getCanvasHeight=function() { return mElement.height; }

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
        var startRadiusPx = startRadius * canvasInfo.radiusX();
        var endRadiusPx = endRadius * canvasInfo.radiusX();
        var middlePx = (startRadiusPx + endRadiusPx) / 2;
        ctx.arc(canvasInfo.centerX(), canvasInfo.centerY(), middlePx, 0, 2 * Math.PI);
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

    var CanvasInfo=function(width,height){
        this.width=width;
        this.height=height;
        this.radiusX=function(){return this.width/2;}
        this.radiusY=function(){return this.height/2;}
        this.centerX=function(){return this.width/2;}
        this.centerY=function(){return this.height/2;}
        
    }

    var TargetSegment=function(radius,marginWidth,text,segmentColor,marginColor,textColor)
    {
        this.radius=radius;
        this.marginWidth=marginWidth;
        this.text=text;
        this.segmentColor=segmentColor;
        this.marginColor=marginColor;
        this.textColor=textColor;
    }

    var Shot=function(xNormalized, yNormalized, score){
        this.xNormalized=xNormalized;
        this.yNormalized=yNormalized;
        this.score=score;
    }

    return {
        initialize: initialize
    }
})();
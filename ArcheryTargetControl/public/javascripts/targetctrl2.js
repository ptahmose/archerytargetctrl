var targetControl = (function()
{
    var mElement;
    var mSvgElement;
    var mCurZoom = 1;
    
    // 0 : InteractionMode.Invalid;
    // 1 : InteractionMode.Mouse
    // 1 : InteractionMode.Touch
    // 2 : InteractionMode.Stylus
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
        this.element.addEventListener("MSHoldVisual", function (e) {
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

    return {
        initialize: initialize
    }
})();
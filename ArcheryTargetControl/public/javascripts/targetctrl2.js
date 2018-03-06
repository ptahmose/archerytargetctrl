"use strict";
//var targetControl = (function () {
define(['jquery'], function ($) {
    var mElement;
    var mSvgElement;
    var mCurZoom = 1;

    // 0 : InteractionMode.Invalid;
    // 1 : InteractionMode.Mouse
    // 2 : InteractionMode.Touch
    // 3 : InteractionMode.Stylus
    var mCurInteractionMode = 0;

    // 0 : MouseInteractionState.Invalid
    // 1 : MouseInteractionState.OutOfElement
    var mCurMouseInteractionState = 0;

    var mBackupElement;
    var mHitGroup;
    var mShotPositions;
    var mCrosshairElement;

    var mZoomAnimation;
    var mCurZoom;
    var mZoomCenterPos;
    var mZoomAnimation;

    var mTimerMouseOfElement;
    var mLastMousePosNormalized;

    var mLastTimeNormalizedTouchPos;
    var mTimerTouchOutOfElement;

    const FPS_FOR_TIMER_OUTOFELEMENT = 10;
    const SCROLL_SPEED = 0.1;

    var mHitsChangedHandlers;

    var getTargetControlDescription;

    // public
    var initialize = function (idOfCanvasElement, idOfSVGElement, getTargetControlDescription_) {
        getTargetControlDescription = getTargetControlDescription_;
        mHitsChangedHandlers = [];
        var canvas = document.getElementById(idOfCanvasElement);
        var svg = document.getElementById(idOfSVGElement);
        mElement = canvas;
        mSvgElement = svg;
        setupEvents();

        /*
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
        //var h = [new Shot(0.25, 0.25, 6), new Shot(0.25, 0.75, 7), new Shot(0.75, 0.25, 6), new Shot(0.75, 0.75, 6), new Shot(0.5, 0.5, 10)];
        var h = [];
        mShotPositions = h;
        drawHits(h);
        */
        mShotPositions = [];
        insertHitsGroup();
        mCrosshairElement = mSvgElement.getElementById('crosshairGroup');
        resize();
        drawHits(mShotPositions);
    }

    var notifyTargetControlDescriptionChanged = function () {
        // here we re-draw the canvas (with a potentially new TargetControlDescription)
        var ctx = mElement.getContext("2d");
        ctx.setTransform(getCanvasWidth(), 0, 0, getCanvasHeight(), 0, 0);
        ctx.clearRect(0, 0, mElement.width, mElement.height);
        paintTarget(ctx);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        var ctxBackup = mBackupElement.getContext("2d");
        ctxBackup.clearRect(0, 0, mElement.width, mElement.height);
        ctxBackup.drawImage(mElement, 0, 0, getCanvasWidth(), getCanvasHeight());

        fireHitsChanged();
    }

    var on = function (eventName, handler) {
        switch (eventName) {
            case "hitsChanged":
                return mHitsChangedHandlers.push(handler);
            default:
                return alert('write something for this event :)');
        }
    }

    var dispatchHitsChanged = function (arg) {
        var handler, i, len, ref;
        ref = mHitsChangedHandlers;
        for (i = 0, len = ref.length; i < len; i++) {
            handler = ref[i];
            setTimeout(handler, 0, arg);
        }
    };


    // private
    var insertHitsGroup = function () {
        var group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        group.setAttribute('transform', 'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ')');
        mHitGroup = group;
        mSvgElement.getElementById('hits').appendChild(group);
    }

    var drawHits = function (hitCoordinates) {
        stopHiliteAnimations();
        while (mHitGroup.firstChild) { mHitGroup.removeChild(mHitGroup.firstChild); }

        var l = hitCoordinates.length;
        for (var i = 0; i < l; ++i) {
            var v = hitCoordinates[i];
            var group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            group.setAttribute('id', "ghit" + i.toString());

            var hit = document.createElementNS("http://www.w3.org/2000/svg", 'use');
            hit.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#shape');
            hit.setAttribute('id', 'hit' + i.toString());
            hit.setAttribute('class', "HitShapeClass");

            group.setAttribute('transform', 'translate(' + v.xNormalized.toString() + ',' + v.yNormalized.toString() + ') scale(0.1,0.1)');

            group.appendChild(hit);
            mHitGroup.appendChild(group);
        };
    }

    var setupEvents = function () {
        if (window.PointerEvent) {
            // see https://docs.microsoft.com/en-us/microsoft-edge/dev-guide/dom/pointer-events#controlling-for-default-touch-handling
            window.addEventListener("pointerup", onPointerUpWindowPointerApi);
            window.addEventListener("pointermove", onPointerMoveWindowPointerApi);

            mElement.addEventListener("pointerdown", onPointerDownHandlerPointerApi);
            mElement.addEventListener("pointerover", onPointerOverHandlerPointerApi);
            mElement.addEventListener("pointerup", onPointerUpHandlerPointerApi);
            mElement.addEventListener("pointermove", onPointerMoveHandlerPointerApi);
            mElement.addEventListener("pointerout", onPointerOutHandlerPointerApi);
            mElement.addEventListener("pointercancel", onPointerCancelHandlerPointerApi)
            mElement.addEventListener("pointerleave", onPointerLeaveHandlerPointerApi)
        }
        else {
            mElement.addEventListener("mousedown", onMouseDownHandler);
            mElement.addEventListener("mouseup", onMouseUpHandler);
            mElement.addEventListener("mousemove", onMouseMoveHandler);
            mElement.addEventListener("mouseout", onMouseOutHandler);

            window.addEventListener("mouseup", onMouseUpWindow);
            window.addEventListener("mousemove", onMouseMoveWindow);

            mElement.addEventListener("touchstart", onTouchStart);
            mElement.addEventListener("touchmove", onTouchMove);
            mElement.addEventListener("touchend", onTouchEnd);
            mElement.addEventListener("ontouchcancel", onTouchCancel);

            mElement.addEventListener("pointerdown", onPointerDown, false);

        }

        window.addEventListener("keydown", onKeyDownWindow);
        mElement.addEventListener("contextmenu", function (e) { e.preventDefault(); }, true);

        // this prevents the "hold-visual" from appearing (works only on Edge, cf. https://stackoverflow.com/questions/46714590/how-to-remove-default-box-outline-animation-in-chrome-on-touchstart-hold?noredirect=1&lq=1)
        mElement.addEventListener("MSHoldVisual", function (e) {
            e.preventDefault();
        }, false);

        // Register an event listener to call the resizeCanvas() function 
        // each time the window is resized.
        window.addEventListener('resize', /*resizeCtrl*/resize, false);
        // Draw canvas border for the first time.
        //resizeCtrl();
        //var container = $(mElement).parent();
        //container.resize(resize);
    }

    var calcCanvasSizeFromParentContainerSize = function () {
        var container = $(mElement).parent();
        var viewportWidth = container.width();
        var viewportHeight = container.height();
        var canvasWidth = Math.min(viewportWidth, viewportHeight);
        var canvasHeight = canvasWidth;
        return { canvasWidth: canvasWidth, canvasHeight: canvasHeight, top: (viewportHeight - canvasHeight) / 2, left: (viewportWidth - canvasWidth) / 2 };
    }

    var resize = function () {
        var size = calcCanvasSizeFromParentContainerSize();
        mElement.style.position = "absolute";
        mElement.setAttribute("width", size.canvasWidth);
        mElement.setAttribute("height", size.canvasHeight);
        mElement.style.top = size.top + "px";
        mElement.style.left = size.left + "px";

        mSvgElement.style.width = size.canvasWidth + 'px';
        mSvgElement.style.height = size.canvasHeight + 'px';
        mSvgElement.style.top = size.top + "px";
        mSvgElement.style.left = size.left + "px";

        var ctx = mElement.getContext("2d");
        ctx.setTransform(getCanvasWidth(), 0, 0, getCanvasHeight(), 0, 0);
        paintTarget(ctx);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        mBackupElement = document.createElement("canvas");
        mBackupElement.width = getCanvasWidth();//this.canvasWidth;
        mBackupElement.height = getCanvasHeight();//this.canvasHeight;
        var ctxBackup = mBackupElement.getContext("2d");
        ctxBackup.drawImage(mElement, 0, 0, getCanvasWidth(), getCanvasHeight());

        mHitGroup.setAttribute('transform', 'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ')');

        var t = mCrosshairElement.getAttribute('transform');
        var re = "scale\\((.*?),(.*?)\\)";
        var found = t.match(re);
        if (found != null && found.length >= 3) {
            var x = parseFloat(found[1]); var y = parseFloat(found[2]);
            if (x != 0 && y != 0) {
                var s = 'scale(' + getCanvasWidth() + ',' + getCanvasHeight() + ')';
                var r = t.replace(/scale\(.*?\)/, s);
                mCrosshairElement.setAttribute('transform', r);
            }
        }
    }

    /*  var resizeCtrl=function(canvas){
          var container = $(mElement).parent();
          var w = container.width();
          var h = container.height();
          console.log("W="+w+" H="+h);
  
          if (w==mElement.width&&h==mElement.height){
              return;
          }
  
  
          var canvasWidth = Math.min(w,h);
          var canvasHeight=canvasWidth;
          var viewportHeight=h;
          var viewportWidth=w;
  
          mElement.style.position = "absolute";
          mElement.setAttribute("width", canvasWidth);
          mElement.setAttribute("height", canvasHeight);
          mElement.style.top = (viewportHeight - canvasHeight) / 2 + "px";
          mElement.style.left = (viewportWidth - canvasWidth) / 2 + "px";
  
          //mSvgElement.style.position = "absolute";
          //mSvgElement.setAttribute("width", canvasWidth);
          //mSvgElement.setAttribute("height", canvasHeight);
          mSvgElement.style.top = (viewportHeight - canvasHeight) / 2 + "px";
          mSvgElement.style.left = (viewportWidth - canvasWidth) / 2 + "px";
          mSvgElement.style.width=canvasWidth+'px';
          mSvgElement.style.height=canvasHeight+'px';
  
          var ctx = mElement.getContext("2d");
          ctx.setTransform(getCanvasWidth(), 0, 0, getCanvasHeight(), 0, 0);
          paintTarget(ctx);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
  
          mBackupElement = document.createElement("canvas");
          mBackupElement.width = getCanvasWidth();//this.canvasWidth;
          mBackupElement.height = getCanvasHeight();//this.canvasHeight;
          var ctxBackup = mBackupElement.getContext("2d");
          ctxBackup.drawImage(mElement, 0, 0, getCanvasWidth(), getCanvasHeight());
  
          //insertHitsGroup();
          mHitGroup.setAttribute('transform', 'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ')');
          //var h = [new Shot(0.25, 0.25, 6), new Shot(0.25, 0.75, 7), new Shot(0.75, 0.25, 6), new Shot(0.75, 0.75, 6), new Shot(0.5, 0.5, 10)];
          //var h = [];
          //mShotPositions = h;
          //drawHits(h);
  
      }*/


    var getMousePos = function (canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    var runZoomInAnimation = function (ev, startZoom, endZoom, whenDone) {
        runZoomInAnimation_(getMousePos(mElement, ev), startZoom, endZoom, whenDone);
    }

    var runZoomInAnimation_ = function (zoomCenter, startZoom, endZoom, whenDone) {
        mZoomCenterPos = zoomCenter;
        mZoomAnimation = $({ xyz: startZoom });
        mZoomAnimation.animate(
            { xyz: endZoom },
            {
                duration: 150,
                step: function (now, fx) {
                    //console.log("anim now " + now);
                    var ctx = mElement.getContext("2d");
                    if (startZoom < endZoom) {
                        ctx.clearRect(0, 0, mElement.width, mElement.height);
                    }
                    setTransform(ctx, mZoomCenterPos.x, mZoomCenterPos.y, now);
                    ctx.drawImage(mBackupElement, 0, 0, getCanvasWidth(), getCanvasHeight());

                    setHitGraphicsTransform(mZoomCenterPos.x, mZoomCenterPos.y, now);

                    mCurZoom = now;
                },
                complete: function (now, fx) {
                    var ctx = mElement.getContext("2d");
                    ctx.clearRect(0, 0, mElement.width, mElement.height);
                    drawZoomed(ctx, mZoomCenterPos.x, mZoomCenterPos.y, endZoom);

                    setHitGraphicsTransform(mZoomCenterPos.x, mZoomCenterPos.y, endZoom);

                    mCurZoom = endZoom;
                    mZoomAnimation = null;
                    if (mCurZoom == 1) {
                        mZoomCenterPos = null;
                    }
                },
                always: function (now, jumpedToEnd) {
                    //console.log("I am in always " + now + " " + jumpedToEnd);
                    if (whenDone != null) whenDone();
                }
            });
    }

    var onMouseDownHandler = function (ev) {
        if (mCurInteractionMode == 0/*invalid*/ || mCurInteractionMode == 1) {
            if (mZoomAnimation != null) {
                mZoomAnimation.stop();
            }

            runZoomInAnimation(ev, mCurZoom, 0.1);
            mCurInteractionMode = 1 /*InteractionMode.Mouse*/;
        }
        ev.preventDefault();
        // console.log("Down");
    }

    var onMouseUpHandler = function (ev) {
        if (mCurInteractionMode == 1/*InteractionMode.Mouse*/) {
            if (mZoomAnimation != null) {
                mZoomAnimation.stop();
            }

            var pos = getMousePosNormalized(mElement, ev);
            var posTransformed = transformToUnzoomedNormalized(pos);
            addShot(posTransformed.x, posTransformed.y);
            runZoomInAnimation(ev, mCurZoom, 1,
                function () { mCurInteractionMode = 0/*InteractionMode.Invalid*/; });
        }
    }

    var onMouseMoveHandler = function (ev) {
        ev.preventDefault();
        if (mCurInteractionMode == 1/*InteractionMode.Mouse*/ || mCurInteractionMode == 0/*InteractionMode.Invalid*/) {
            var pos = getMousePos(mElement, ev);

            var transX = (pos.x - getCanvasWidth() / 2) / getCanvasWidth();
            var transY = (pos.y - getCanvasHeight() / 2) / getCanvasHeight();
            mCrosshairElement.setAttribute(
                'transform',
                'scale(' + getCanvasWidth() + ',' + getCanvasHeight() + ') translate(' + transX + ',' + transY + ') ');
        }

        if (mTimerMouseOfElement != null) {
            window.clearInterval(mTimerMouseOfElement);
            mTimerMouseOfElement = null;
        }

        mLastMousePosNormalized = null;
        mCurMouseInteractionState = 0/*MouseInteractionState.Invalid*/;
    }

    var onMouseOutHandler = function (ev) {
        if (mCurInteractionMode == 1/*InteractionMode.Mouse*/) {
            mCurMouseInteractionState = 1/*MouseInteractionState.OutOfElement*/;
        }
    }

    var onMouseUpWindow = function (ev) {
        if (mCurMouseInteractionState == 1/*MouseInteractionState.OutOfElement*/ && mCurInteractionMode == 1/*InteractionMode.Mouse*/) {
            if (mZoomAnimation != null) {
                mZoomAnimation.stop();
            }

            mLastMousePosNormalized = null;
            mCurMouseInteractionState = 0/*MouseInteractionState.Invalid*/;
            if (mTimerMouseOfElement != null) {
                window.clearInterval(mTimerMouseOfElement);
                mTimerMouseOfElement = null;
            }

            runZoomInAnimation(ev, this.curZoom, 1,
                function () { mCurInteractionMode = 0/*InteractionMode.Invalid*/; });
        }
    }

    var onMouseMoveWindow = function (ev) {
        if (mCurMouseInteractionState == 1/*MouseInteractionState.OutOfElement*/) {
            if (mTimerMouseOfElement == null) {
                mTimerMouseOfElement = window.setInterval(
                    function () { onTimerMouseOutOfElement(); }, 1000 / FPS_FOR_TIMER_OUTOFELEMENT);
            }

            var pos = getMousePosNormalized(mElement, ev);
            mLastMousePosNormalized = pos;
        }
    }

    var onKeyDownWindow = function (ev) {
        /*const zoomlevel=1;
        $(this).css({
            "-moz-transform":"scale("+zoomlevel+")",
            "-webkit-transform":"scale("+zoomlevel+")",
            "-o-transform":"scale("+zoomlevel+")",
            "-ms-transform":"scale("+zoomlevel+")"
        });*/

        // var scale = 'scale(1)';
        // document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
        //  document.body.style.msTransform =   scale;       // IE 9
        //  document.body.style.transform = scale;     // General

        //document.body.style.zoom = screen.logicalXDPI / screen.deviceXDPI;
        // $('meta[name=viewport]').remove();
        // $('head').append('<meta name="viewport" content="width=device-width, maximum-scale=1.0, user-scalable=0">');
        // $('meta[name=viewport]').remove();
        // $('head').append('<meta name="viewport" content="width=device-width, initial-scale=yes">' );


        if (ev.keyCode == 27 || ev.keyCode == 8) {
            if (mCurInteractionMode != 0/*InteractionMode.Invalid*/) {
                cancelZoomAddArrowOperation();
            }
        }
        else if (ev.keyCode == 40)    // key down
        {
            mZoomCenterPos.y += 20;
            var ctx = this.element.getContext("2d");
            drawZoomed(ctx, mZoomCenterPos.x, mZoomCenterPos.y, 0.1);
        }
    }

    var cancelZoomAddArrowOperation = function () {
        if (mZoomAnimation != null) {
            mZoomAnimation.stop();
        }

        runZoomInAnimation_(mZoomCenterPos, mCurZoom, 1, function () { mCurInteractionMode = 0/*InteractionMode.Invalid*/; });
    }

    var onTouchStart = function (ev) {
        ev.preventDefault();

        if (mCurInteractionMode == 0/*InteractionMode.Invalid*/ || mCurInteractionMode == 3 || mCurInteractionMode == 2) {
            if (mZoomAnimation != null) {
                mZoomAnimation.stop();
            }

            // set the interaction-mode only in case it wasn't previously set by "onPointerDown"
            if (mCurInteractionMode == 0) {
                mCurInteractionMode = 2/*InteractionMode.Touch*/;
            }

            //var rect = mElement.getBoundingClientRect();
            //var pos = { x: ev.touches[0].clientX - rect.left, y: ev.touches[0].clientY - rect.top };
            var pos = getOffsetedTouchPos(ev);
            mCrosshairElement.setAttribute('transform',
                'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ') translate(' + (pos.x - getCanvasWidth() / 2) / getCanvasWidth() + ',' + (pos.y - getCanvasHeight() / 2) / getCanvasHeight() + ') ');

            runZoomInAnimation_({ x: pos.x, y: pos.y + getTouchOffset() * (1 + 0.1) }, mCurZoom, 0.1);
        }
    }

    var onTouchMove = function (ev) {
        if (mCurInteractionMode == 2/*InteractionMode.Touch*/ || mCurInteractionMode == 3/*InteractionMode.Style*/ || mCurInteractionMode == 0/*InteractionMode.Invalid*/) {
            var pos = getOffsetedTouchPosAndNormalizedPos(ev);

            //console.log("x:" + pos[1].x + " y:" + pos[1].y);
            mCrosshairElement.setAttribute('transform',
                'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ') translate(' + (pos[0].x - getCanvasWidth() / 2) / getCanvasWidth() + ',' + (pos[0].y - getCanvasHeight() / 2) / getCanvasHeight() + ') ');

            if (updatePositionBasedOnNormalizedTouchPos(pos[1])) {
                mLastTimeNormalizedTouchPos = pos[1];
                if (mTimerTouchOutOfElement == null) {
                    mTimerTouchOutOfElement = window.setInterval(onTouchAtEdgesOrOutOfElementTimer, 1000 / 10);
                }
            }
            else {
                turnOffTouchTimer();
            }
        }

        ev.preventDefault();
        //console.log("TouchMove "+pos.x+" "+pos.y);
    }

    var updatePositionBasedOnNormalizedTouchPos = function (pos) {
        if (pos.x > 0.45 || pos.x < -0.45 || pos.y > 0.45 || pos.y < -0.45) {
            var dir = { x: 2 * (pos.x), y: 2 * (pos.y) };
            var l = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
            dir = { x: dir.x / l, y: dir.y / l };

            mZoomCenterPos.x += dir.x * 5;
            mZoomCenterPos.y += dir.y * 5;
            var ctx = mElement.getContext("2d");
            ctx.clearRect(0, 0, mElement.width, mElement.height);
            drawZoomed(ctx, mZoomCenterPos.x, mZoomCenterPos.y, mCurZoom);
            setHitGraphicsTransform(mZoomCenterPos.x, mZoomCenterPos.y, mCurZoom);
            return true;
        }
        return false;
    }

    var onTouchAtEdgesOrOutOfElementTimer = function () {
        if (mLastTimeNormalizedTouchPos != null) {
            updatePositionBasedOnNormalizedTouchPos(mLastTimeNormalizedTouchPos);
        }
    }

    var getOffsetedTouchPos = function (ev) {
        var rect = mElement.getBoundingClientRect();
        var pos = { x: ev.touches[0].clientX - rect.left, y: ev.touches[0].clientY - rect.top };
        return { x: pos.x, y: pos.y - getTouchOffset() };
    }
    var getOffsetedTouchPosXY = function (clientX, clientY) {
        var rect = mElement.getBoundingClientRect();
        var pos = { x: clientX - rect.left, y: clientY - rect.top };
        return { x: pos.x, y: pos.y - getTouchOffset() };
    }

    var getOffsetedTouchPosAndNormalizedPos = function (ev) {
        // the normalized coordinate is in the range -0.5 - 0.5
        var rect = mElement.getBoundingClientRect();
        var pos = { x: ev.touches[0].clientX - rect.left, y: ev.touches[0].clientY - rect.top };
        var centerPos = { x: rect.width / 2, y: rect.height / 2 };
        var diff = { x: pos.x - centerPos.x, y: pos.y - centerPos.y };
        var normalized = { x: diff.x / rect.width, y: diff.y / rect.height };
        return [{ x: pos.x, y: pos.y - getTouchOffset() }, normalized];
    }
    var getOffsetedTouchPosAndNormalizedPosXY = function (clientX, clientY) {
        // the normalized coordinate is in the range -0.5 - 0.5
        var rect = mElement.getBoundingClientRect();
        var pos = { x: clientX - rect.left, y: clientY - rect.top };
        var centerPos = { x: rect.width / 2, y: rect.height / 2 };
        var diff = { x: pos.x - centerPos.x, y: pos.y - centerPos.y };
        var normalized = { x: diff.x / rect.width, y: diff.y / rect.height };
        return [{ x: pos.x, y: pos.y - getTouchOffset() }, normalized];
    }


    var getNormalizedOffsetedTouchHaircrossPosition = function (evTouchList) {
        var rect = mElement.getBoundingClientRect();
        var pos = { x: evTouchList[0].clientX - rect.left, y: evTouchList[0].clientY - rect.top - getTouchOffset() };
        var centerPos = { x: rect.width / 2, y: rect.height / 2 };
        var diff = { x: pos.x - centerPos.x, y: pos.y - centerPos.y };
        var normalized = { x: diff.x / rect.width + 0.5, y: diff.y / rect.height + 0.5 };
        return normalized;
    }
    var getNormalizedOffsetedTouchHaircrossPositionXY = function (clientX, clientY) {
        var rect = mElement.getBoundingClientRect();
        var pos = { x: clientX - rect.left, y: clientY - rect.top - getTouchOffset() };
        var centerPos = { x: rect.width / 2, y: rect.height / 2 };
        var diff = { x: pos.x - centerPos.x, y: pos.y - centerPos.y };
        var normalized = { x: diff.x / rect.width + 0.5, y: diff.y / rect.height + 0.5 };
        return normalized;
    }


    var getTouchOffset = function () {
        if (mCurInteractionMode == 3/*InteractionMode.Stylus*/) {
            return 0;
        }
        return 100;
    }

    var turnOffTouchTimer = function () {
        if (mTimerTouchOutOfElement != null) {
            window.clearInterval(mTimerTouchOutOfElement);
            mTimerTouchOutOfElement = null;
            mLastTimeNormalizedTouchPos = null;
        }
    }

    var onTouchEnd = function (ev) {
        var zoomInActionWasStillActive = false;
        if (mZoomAnimation != null) {
            zoomInActionWasStillActive = true;
        }
        if (mCurInteractionMode == 2/*InteractionMode.Touch*/ || mCurInteractionMode == 3/*InteractionMode.Stylus*/) {
            if (mZoomAnimation != null) {
                mZoomAnimation.stop();
            }

            runZoomInAnimation_(mZoomCenterPos, mCurZoom, 1, function () { mCurInteractionMode = 0/*InteractionMode.Invalid*/; });
        }

        turnOffTouchTimer();

        // only add the shot if the ZoomIn-operation was complete
        if (zoomInActionWasStillActive == false) {
            var pos = getNormalizedOffsetedTouchHaircrossPosition(ev.changedTouches);

            var outOfElement = false;
            if (pos.x < 0 || pos.x > 1 || pos.y < 0 || pos.y > 1) {
                outOfElement = true;
            }
            //var pos = getMousePosNormalized(mElement, ev);
            var posTransformed = transformToUnzoomedNormalized(pos);
            //console.log(ev);
            if (outOfElement == false) {
                addShot(posTransformed.x, posTransformed.y);
            }
        }

        ev.preventDefault();
    }

    var onTouchCancel = function (ev) {
        turnOffTouchTimer();
        this.cancelZoomAddArrowOperation();
        //console.log("Touch cancel");
    }

    function pointerTypeToInteractionMode(ev) {
        switch (ev.pointerType) {
            case "pen":
                return 3/*InteractionMode.Stylus*/;
            case "touch":
                return 2/*InteractionMode.Touch*/;
            case "mouse":
                return 1/*InteractionMode.Touch*/;
        }
        return 0;
    }

    /**
     * This event (from the "new" HTML5-pointer-API) is used to determine whether a mouse-interaction,
     * touch- or stylus-interaction is initiated. With touchStart/.. it is impossible to distinguish
     * stylus from touch, so we rely on this one.
     * TODO: it seems favorable to use the "new HTML5-pointer API" exclusively (https://developer.mozilla.org/en-US/docs/Web/Events/pointerdown).
     * @param {any} ev pointer-event
     * @returns 
     */
    var onPointerDown = function (ev) {
        switch (ev.pointerType) {
            case "pen":
                mCurInteractionMode = 3/*InteractionMode.Stylus*/;
                break;
            case "touch":
                mCurInteractionMode = 2/*InteractionMode.Touch*/;
                break;
            case "mouse":
                mCurInteractionMode = 1/*InteractionMode.Touch*/;
                break;
        }
    }

    var getCanvasWidth = function () { return mElement.width; }
    var getCanvasHeight = function () { return mElement.height; }

    var paintTarget = function (ctx) {
        var canvasInfo = new CanvasInfo(1, 1);
        //var targetSegments = getTargetSegments/*Spots*/();// getTargetSegments();
        var targetSegments = getTargetControlDescription();

        var targetSegmentsLength = targetSegments.length;
        for (var si = 0; si < targetSegmentsLength; ++si) {
            var segments = targetSegments[si];
            var segmentsSegmentsLength = segments.segments.length;
            for (var i = 0; i < segmentsSegmentsLength; ++i) {
                var s = segments.segments[i];
                var segmentEndRadius;
                if (i < targetSegments.length - 1) {
                    segmentEndRadius = segments.segments[i + 1].radius;
                } else {
                    segmentEndRadius = 0;
                }
                paintSegmentTs(ctx, canvasInfo, segments.centerX, segments.centerY, s.radius, s.radius - s.marginWidth, s.marginColor);
                paintSegmentTs(ctx, canvasInfo, segments.centerX, segments.centerY, s.radius - s.marginWidth, segmentEndRadius, s.segmentColor);
            }
        }
    }

    function rgbToHex(rgb) {
        var rgb = rgb[2] | (rgb[1] << 8) | (rgb[0] << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }

    var paintSegmentTs = function (ctx, canvasInfo, centerX, centerY, startRadius, endRadius, color) {
        ctx.beginPath();
        var startRadiusPx = startRadius * canvasInfo.radiusX();
        var endRadiusPx = endRadius * canvasInfo.radiusX();
        var middlePx = (startRadiusPx + endRadiusPx) / 2;
        ctx.arc(centerX * canvasInfo.width/*canvasInfo.centerX()*/, centerY * canvasInfo.height/*canvasInfo.centerY()*/, middlePx, 0, 2 * Math.PI);
        ctx.lineWidth = -endRadiusPx + startRadiusPx;
        ctx.strokeStyle = rgbToHex(color);
        ctx.stroke();
    }

    var CanvasInfo = function (width, height) {
        this.width = width;
        this.height = height;
    }

    CanvasInfo.prototype.radiusX = function () { return this.width / 2; }
    CanvasInfo.prototype.radiusY = function () { return this.height / 2; }
    CanvasInfo.prototype.centerX = function () { return this.width / 2; }
    CanvasInfo.prototype.centerY = function () { return this.height / 2; }


    var setTransform = function (ctx, centerX, centerY, zoom) {
        zoom = 1 / zoom;

        // calculate the coordinate of the center of the scaled rectangle
        var xP = (getCanvasWidth() * zoom) / 2;
        var yP = (getCanvasHeight() * zoom) / 2;

        var distX = (getCanvasWidth() / 2) - centerX;
        var distY = (getCanvasHeight() / 2) - centerY;

        // and now we need to translate (xP,yP) to the center
        var xDiff = xP - centerX;
        var yDiff = yP - centerY;

        xDiff -= distX * zoom;
        yDiff -= distY * zoom;

        ctx.setTransform(zoom, 0, 0, zoom, -xDiff, -yDiff);
    }

    var setHitGraphicsTransform = function (centerX, centerY, zoom) {
        zoom = 1 / zoom;

        // calculate the coordinate of the center of the scaled rectangle
        var xP = (getCanvasWidth() * zoom) / 2;
        var yP = (getCanvasHeight() * zoom) / 2;

        var distX = (getCanvasWidth() / 2) - centerX;
        var distY = (getCanvasHeight() / 2) - centerY;

        // and now we need to translate (xP,yP) to the center
        var xDiff = xP - centerX;
        var yDiff = yP - centerY;

        xDiff -= distX * zoom;
        yDiff -= distY * zoom;

        var scale = 1 / zoom;
        var xx = getCanvasWidth() / 2 * zoom - ((getCanvasWidth() / 2));
        var yy = getCanvasHeight() / 2 * zoom - ((getCanvasHeight() / 2));

        var wx = getCanvasWidth() * zoom;
        var wy = getCanvasHeight() * zoom;

        var xx1 = (centerX / getCanvasWidth()) * wx - centerX;
        var yy1 = (centerY / getCanvasHeight()) * wy - centerY;

        var t = 'translate(' + (-xx1) + ',' + (-yy1) + ') scale(' + wx + ',' + wy + ')  ';

        mHitGroup.setAttribute('transform', t);
    }

    var drawZoomed = function (ctx, centerX, centerY, zoom) {
        var xDiff = centerX / zoom - centerX;
        var yDiff = centerY / zoom - centerY;
        ctx.setTransform(getCanvasWidth() / zoom, 0, 0, getCanvasHeight() / zoom, -xDiff, -yDiff);
        paintTarget(ctx);
    }

    var getMousePosNormalized = function (canvas, evt) {
        var pos = getMousePos(canvas, evt);
        return { x: pos.x / getCanvasWidth(), y: pos.y / getCanvasHeight() };
    }

    var transformToUnzoomedNormalized = function (pos) {
        if (mCurZoom == 1 || mZoomCenterPos == null) {
            return pos;
        }

        var posAbs = deNormalize(pos);
        var diff = { dx: (posAbs.x - mZoomCenterPos.x) * mCurZoom, dy: (posAbs.y - mZoomCenterPos.y) * mCurZoom };
        var pos2 = { x: mZoomCenterPos.x + diff.dx, y: mZoomCenterPos.y + diff.dy };
        var posNormalized = normalize(pos2);
        return posNormalized;
    }

    var normalize = function (pos) {
        return { x: pos.x / getCanvasWidth(), y: pos.y / getCanvasHeight() };
    }

    var deNormalize = function (pos) {
        return { x: pos.x * getCanvasWidth(), y: pos.y * getCanvasHeight() };
    }

    var addShot = function (x, y) {
        mShotPositions.push(new Shot(x, y, { "datetime": Date(), "creator": "targetControl" }));
        drawHits(mShotPositions);

        fireHitsChanged();
        //dispatchHitsChanged({ "targetcontrol": this/*targetControl*/ });
        //dispatchHitsChanged({ "getShots": getShots/*targetControl*/,"getTargetSegments":/*getTargetSegments*/getTargetControlDescription });
        /*if (this._hitsChangedEvent != null) {
            this._hitsChangedEvent(this, 42);
        }*/
    }

    var fireHitsChanged = function () {
        dispatchHitsChanged({ "getShots": getShots/*targetControl*/, "getTargetSegments":/*getTargetSegments*/getTargetControlDescription });
    }

    var onTimerMouseOutOfElement = function () {
        if (mLastMousePosNormalized == null || mCurInteractionMode != 1/*InteractionMode.Mouse*/) { return; }
        var dir = { x: 2 * (mLastMousePosNormalized.x - 0.5), y: 2 * (mLastMousePosNormalized.y - 0.5) };
        var l = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        dir = { x: dir.x / l, y: dir.y / l };

        var sx = SCROLL_SPEED * getCanvasWidth() / FPS_FOR_TIMER_OUTOFELEMENT;
        var sy = SCROLL_SPEED * getCanvasHeight() / FPS_FOR_TIMER_OUTOFELEMENT;

        mZoomCenterPos.x += dir.x * sx/*5*/;
        mZoomCenterPos.y += dir.y * sy/*5*/;
        var ctx = mElement.getContext("2d");
        ctx.clearRect(0, 0, mElement.width, mElement.height);
        drawZoomed(ctx, mZoomCenterPos.x, mZoomCenterPos.y, mCurZoom);
        setHitGraphicsTransform(mZoomCenterPos.x, mZoomCenterPos.y, mCurZoom);
    }

    function animateHiliteHit(h, i) {
        h.css({ zyx: 0.0 });
        h.animate({ "zyx": 1 },
            {
                duration: 500,
                step: function (value) {
                    var s;
                    if (i & 1) {

                        s = (1 + value).toString();
                    }
                    else {
                        s = (2 - value).toString();
                    }
                    // console.log(s);
                    this.setAttribute("transform", "scale(" + s + ")");
                },
                complete: function (now) {
                    i = i ^ 1;
                    animateHiliteHit(h, i);
                },
                always: function (now) {
                    this.removeAttribute("transform");
                }
            });
    }

    function stopHiliteAnimations() {
        var allCurHilited = $('.HitShapeClassHilite');
        allCurHilited.attr('class', "HitShapeClass");
        allCurHilited.stop();
    }

    var setHitsToHilite = function (list) {
        var allCurHilited = $('.HitShapeClassHilite');
        allCurHilited.attr('class', "HitShapeClass");
        allCurHilited.stop();

        var selector;
        if ($.isArray(list)) {
            for (var i = 0; i < list.length; ++i) {
                if (i != 0) { selector += ","; }
                else { selector = ''; }
                selector += '#hit' + list[i].toString();
            }
        }
        else {
            selector = '#hit' + list.toString();
        }

        var h = $(/*'#hit'+list.toString()*/selector);
        if (h.length > 0) {
            h.attr('class', "HitShapeClassHilite");
            var i = 0;
            animateHiliteHit(h, i);
        }
    }

    function removeFromArray(arr, from, to) {    // adapted from https://johnresig.com/blog/javascript-array-remove/
        var rest = arr.slice((to || from) + 1 || arr.length);
        arr.length = from < 0 ? arr.length + from : from;
        return arr.push.apply(arr, rest);
    };

    var deleteShot = function (index) {
        console.log("Delete Shot Idx=" + index);
        removeFromArray(mShotPositions, index);
        //mShotPositions.push(new Shot(x, y, 2));
        drawHits(mShotPositions);

        fireHitsChanged();
    }

    var Shot = function (xNormalized, yNormalized, params) {
        this.xNormalized = xNormalized;
        this.yNormalized = yNormalized;
        if (params.hasOwnProperty('datetime')) {
            this.datetime = params.datetime;
        }
        if (params.hasOwnProperty('creator')) {
            this.creator = params.creator;
        }
    }

    var getShots = function () {
        return mShotPositions;
    }

    //--------------------------------------
    var cleanupPointerInteraction=function()
    {
        mLastMousePosNormalized = null;
        mCurMouseInteractionState = 0/*MouseInteractionState.Invalid*/;
        if (mTimerMouseOfElement != null) {
            window.clearInterval(mTimerMouseOfElement);
            mTimerMouseOfElement = null;
        }
        turnOffTouchTimer();
    }

    var updateMouseCrossHair=function(posx,posy){
        var transX = (posx - getCanvasWidth() / 2) / getCanvasWidth();
        var transY = (posy - getCanvasHeight() / 2) / getCanvasHeight();
        mCrosshairElement.setAttribute(
            'transform',
            'scale(' + getCanvasWidth() + ',' + getCanvasHeight() + ') translate(' + transX + ',' + transY + ') ');
    }

    var onPointerUpWindowPointerApi = function (e) { }
    var onPointerMoveWindowPointerApi = function (ev) {
        var interactionMode = pointerTypeToInteractionMode(ev);
        if (interactionMode != mCurInteractionMode) {
            return;
        }

        if (mCurInteractionMode == 1) {
            if (mCurMouseInteractionState == 1) {
                if (mTimerMouseOfElement == null) {
                    mTimerMouseOfElement = window.setInterval(
                        function () { onTimerMouseOutOfElement(); }, 1000 / FPS_FOR_TIMER_OUTOFELEMENT);
                }

                var pos = getMousePosNormalized(mElement, ev);
                mLastMousePosNormalized = pos;
            }
        }
    }

    var onPointerDownHandlerPointerApi = function (ev) {
        var interactionMode = pointerTypeToInteractionMode(ev);
        if (interactionMode != 0) {
            if (mZoomAnimation != null) {
                // if there was a pending animation -> stop it now
                mZoomAnimation.stop();
            }

            // now we are only interested in this mode - either mouse, touch or stylus and nothing else
            mCurInteractionMode = interactionMode;//1 /*InteractionMode.Mouse*/;
            if (mCurInteractionMode == 2) {
                // in case of touch - set the crosshair above the finger
                var pos = getOffsetedTouchPosXY(ev.clientX, ev.clientY);
                mCrosshairElement.setAttribute('transform',
                    'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ') translate(' + (pos.x - getCanvasWidth() / 2) / getCanvasWidth() + ',' + (pos.y - getCanvasHeight() / 2) / getCanvasHeight() + ') ');

                runZoomInAnimation_({ x: pos.x, y: pos.y + getTouchOffset() * (1 + 0.1) }, mCurZoom, 0.1);
            }
            else {
                runZoomInAnimation(ev, mCurZoom, 0.1);
            }

            ev.preventDefault();
        }
    }

    var onPointerUpHandlerPointerApi = function (ev) {
        var interactionMode = pointerTypeToInteractionMode(ev);
        var zoomInActionWasStillActive = false;
        if (mZoomAnimation != null) {
            zoomInActionWasStillActive = true;
        }

        if (mCurInteractionMode == interactionMode) {
            if (mZoomAnimation != null) {
                mZoomAnimation.stop();
            }

            if (mCurInteractionMode != 2) {
                var pos = getMousePosNormalized(mElement, ev);
                var posTransformed = transformToUnzoomedNormalized(pos);
                addShot(posTransformed.x, posTransformed.y);
                runZoomInAnimation(ev, mCurZoom, 1,
                    function () { mCurInteractionMode = 0/*InteractionMode.Invalid*/; });
            }
            else {
                runZoomInAnimation_(mZoomCenterPos, mCurZoom, 1, function () { mCurInteractionMode = 0/*InteractionMode.Invalid*/; });
                turnOffTouchTimer();

                // only add the shot if the ZoomIn-operation was complete
                if (zoomInActionWasStillActive == false) {
                    var pos = getNormalizedOffsetedTouchHaircrossPositionXY(ev.clientX, ev.clientY);

                    var outOfElement = false;
                    if (pos.x < 0 || pos.x > 1 || pos.y < 0 || pos.y > 1) {
                        outOfElement = true;
                    }
                    //var pos = getMousePosNormalized(mElement, ev);
                    var posTransformed = transformToUnzoomedNormalized(pos);
                    //console.log(ev);
                    if (outOfElement == false) {
                        addShot(posTransformed.x, posTransformed.y);
                    }
                }
            }
        }
    }
    var onPointerMoveHandlerPointerApi = function (ev) {
        console.log("PointerMove");
        var interactionMode = pointerTypeToInteractionMode(ev);
        ev.preventDefault();
        if (mCurInteractionMode==0&&interactionMode==1)
        {
            var pos=getMousePos(mElement,ev);
            console.log(ev.clientX+" "+ev.clientY+"; "+pos.x+" "+pos.y);
            updateMouseCrossHair(pos.x,pos.y);
            return;
        }


        if (interactionMode != mCurInteractionMode) {
            // we are only interested in event of the same type as the one that started the action
            return;
        }

        if (mCurInteractionMode != 2) {
            var pos = getMousePos(mElement, ev);
            console.log("PointerMove:" + pos.x + " " + pos.y);
            var transX = (pos.x - getCanvasWidth() / 2) / getCanvasWidth();
            var transY = (pos.y - getCanvasHeight() / 2) / getCanvasHeight();
            mCrosshairElement.setAttribute(
                'transform',
                'scale(' + getCanvasWidth() + ',' + getCanvasHeight() + ') translate(' + transX + ',' + transY + ') ');


            if (mTimerMouseOfElement != null) {
                window.clearInterval(mTimerMouseOfElement);
                mTimerMouseOfElement = null;
            }

            mLastMousePosNormalized = null;
            mCurMouseInteractionState = 0/*MouseInteractionState.Invalid*/;
        }
        else {
            var pos = getOffsetedTouchPosAndNormalizedPosXY(ev.clientX, ev.clientY);

            //console.log("x:" + pos[1].x + " y:" + pos[1].y);
            mCrosshairElement.setAttribute('transform',
                'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ') translate(' + (pos[0].x - getCanvasWidth() / 2) / getCanvasWidth() + ',' + (pos[0].y - getCanvasHeight() / 2) / getCanvasHeight() + ') ');

            if (updatePositionBasedOnNormalizedTouchPos(pos[1])) {
                mLastTimeNormalizedTouchPos = pos[1];
                if (mTimerTouchOutOfElement == null) {
                    mTimerTouchOutOfElement = window.setInterval(onTouchAtEdgesOrOutOfElementTimer, 1000 / 10);
                }
            }
            else {
                turnOffTouchTimer();
            }
        }
    }

    var onPointerOutHandlerPointerApi = function (ev) {
        console.log("POINTER OUT");
        var interactionMode = pointerTypeToInteractionMode(ev);
        if (interactionMode != mCurInteractionMode) {
            return;
        }

        //   if (mCurInteractionMode == 1/*InteractionMode.Mouse*/) {
        mCurMouseInteractionState = 1/*MouseInteractionState.OutOfElement*/;
        // }
    }

    var onPointerCancelHandlerPointerApi = function (ev) {
        console.log("POINTER CANCEL");
    }

    var onPointerLeaveHandlerPointerApi = function (ev) {
        console.log("POINTER LEAVE");
    }

    var onPointerOverHandlerPointerApi = function (ev) {
        console.log("POINTER OVER");
    }


    return {
        initialize: initialize,
        on: on,
        getShots: getShots,
        notifyTargetControlDescriptionChanged: notifyTargetControlDescriptionChanged,
        setHitHilite: setHitsToHilite,
        deleteShot: deleteShot
    }
});
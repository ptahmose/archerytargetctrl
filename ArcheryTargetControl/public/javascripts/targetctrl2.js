var targetControl = (function () {
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

    // public
    var initialize = function (idOfCanvasElement, idOfSVGElement) {
        var canvas = document.getElementById(idOfCanvasElement);
        var svg = document.getElementById(idOfSVGElement);
        mElement = canvas;
        mSvgElement = svg;
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
        var h = [new Shot(0.25, 0.25, 6), new Shot(0.25, 0.75, 7), new Shot(0.75, 0.25, 6), new Shot(0.75, 0.75, 6), new Shot(0.5, 0.5, 10)];
        mShotPositions = h;
        drawHits(h);

        mCrosshairElement = mSvgElement.getElementById('crosshairGroup');
    }

    // private
    var insertHitsGroup = function () {
        var group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        group.setAttribute('transform', 'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ')');
        mHitGroup = group;
        mSvgElement.getElementById('hits').appendChild(group);
    }

    var drawHits = function (hitCoordinates) {
        while (mHitGroup.firstChild) { mHitGroup.removeChild(mHitGroup.firstChild); }

        hitCoordinates.forEach((v) => {
            var hit = document.createElementNS("http://www.w3.org/2000/svg", 'use');
            hit.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#shape');
            hit.setAttribute('transform', 'translate(' + v.xNormalized.toString() + ',' + v.yNormalized.toString() + ') scale(0.1,0.1)');
            mHitGroup.appendChild(hit);
        });
    }

    var setupEvents = function () {
        mElement.addEventListener("mousedown", onMouseDownHandler);
        mElement.addEventListener("mouseup", onMouseUpHandler);
        mElement.addEventListener("mousemove", onMouseMoveHandler);
        mElement.addEventListener("mouseout", onMouseOutHandler);

        window.addEventListener("mouseup", onMouseUpWindow);
        window.addEventListener("mousemove", onMouseMoveWindow);
        window.addEventListener("keydown", onKeyDownWindow);

        mElement.addEventListener("touchstart", onTouchStart);
        mElement.addEventListener("touchmove", onTouchMove);
        mElement.addEventListener("touchend", onTouchEnd);
        mElement.addEventListener("ontouchcancel", onTouchCancel);

        mElement.addEventListener("pointerdown", onPointerDown, false);

        mElement.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        }, true);

        // this prevents the "hold-visual" from appearing (works only on Edge, cf. https://stackoverflow.com/questions/46714590/how-to-remove-default-box-outline-animation-in-chrome-on-touchstart-hold?noredirect=1&lq=1)
        mElement.addEventListener("MSHoldVisual", function (e) {
            e.preventDefault();
        }, false);
    }

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
                    setTransform(ctx, mZoomCenterPos.x, mZoomCenterPos.y, now);
                    ctx.drawImage(mBackupElement, 0, 0, getCanvasWidth(), getCanvasHeight());

                    setHitGraphicsTransform(mZoomCenterPos.x, mZoomCenterPos.y, now);

                    mCurZoom = now;
                },
                complete: function (now, fx) {
                    var ctx = mElement.getContext("2d");
                    drawZoomed(ctx, mZoomCenterPos.x, mZoomCenterPos.y, endZoom);

                    setHitGraphicsTransform(mZoomCenterPos.x, mZoomCenterPos.y, endZoom);

                    mCurZoom = endZoom;
                    mZoomAnimation = null;
                    if (mCurZoom == 1) {
                        mZoomCenterPos = null;
                    }
                },
                always: function (now, jumpedToEnd) {
                    console.log("I am in always " + now + " " + jumpedToEnd);
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
        console.log("Down");
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

        runZoomInAnimation_(mZoomCenterPos, mCurZoom, 1, () => { mCurInteractionMode = 0/*InteractionMode.Invalid*/; });
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
        if (mCurInteractionMode == 2/*InteractionMode.Touch*/||mCurInteractionMode == 3/*InteractionMode.Style*/ || mCurInteractionMode == 0/*InteractionMode.Invalid*/) {
            //var rect = mElement.getBoundingClientRect();
            //var pos = { x: ev.touches[0].clientX - rect.left, y: ev.touches[0].clientY - rect.top };
            var pos = getOffsetedTouchPosAndNormalizedPos(ev);

            console.log("x:" + pos[1].x + " y:" + pos[1].y);
            mCrosshairElement.setAttribute('transform',
                'scale(' + getCanvasWidth() + ',' + getCanvasWidth() + ') translate(' + (pos[0].x - getCanvasWidth() / 2) / getCanvasWidth() + ',' + (pos[0].y - getCanvasHeight() / 2) / getCanvasHeight() + ') ');

            /* if (pos[1].x > 0.45 || pos[1].x<-0.45 || pos[1].y>0.45||pos[1].y<-0.45)                
             {
                 var dir = { x: 2 * (pos[1].x ), y: 2 * (pos[1].y ) };
                 var l = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
                 dir = { x: dir.x / l, y: dir.y / l };
 
                 mZoomCenterPos.x += dir.x*5;
                 mZoomCenterPos.y += dir.y*5;
                 var ctx = mElement.getContext("2d");
         
                 drawZoomed(ctx, mZoomCenterPos.x, mZoomCenterPos.y, mCurZoom);
                 setHitGraphicsTransform(mZoomCenterPos.x, mZoomCenterPos.y, mCurZoom);
 
                 mLastTimeNormalizedTouchPos=pos[1];
                 if (mTimerTouchOutOfElement==null)
                 {
                     mTimerTouchOutOfElement=window.setInterval(onTouchAtEdgesOrOutOfElement,1000/10);
                 }
             }*/
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

    var getOffsetedTouchPosAndNormalizedPos = function (ev) {
        // the normalized coordinate is in the range -0.5 - 0.5
        var rect = mElement.getBoundingClientRect();
        var pos = { x: ev.touches[0].clientX - rect.left, y: ev.touches[0].clientY - rect.top };
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
        //var coord={x:normalized.x/10+mZoomCenterPos.x/getCanvasWidth(),y:normalized.y/10+mZoomCenterPos.y/getCanvasHeight()};
        //return coord;
    }


    var getTouchOffset = function () {
        if (mCurInteractionMode != 3/*InteractionMode.Stylus*/) {
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

            runZoomInAnimation_(mZoomCenterPos, mCurZoom, 1, () => { mCurInteractionMode = 0/*InteractionMode.Invalid*/; });
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

    function rgbToHex(rgb) {
        var rgb = rgb[2] | (rgb[1] << 8) | (rgb[0] << 16);
        return '#' + (0x1000000 + rgb).toString(16).slice(1)
    }

    var paintSegmentTs = function (ctx, canvasInfo, startRadius, endRadius, color) {
        ctx.beginPath();
        var startRadiusPx = startRadius * canvasInfo.radiusX();
        var endRadiusPx = endRadius * canvasInfo.radiusX();
        var middlePx = (startRadiusPx + endRadiusPx) / 2;
        ctx.arc(canvasInfo.centerX(), canvasInfo.centerY(), middlePx, 0, 2 * Math.PI);
        ctx.lineWidth = -endRadiusPx + startRadiusPx;
        ctx.strokeStyle = rgbToHex(color);
        ctx.stroke();
    }

    var getTargetSegments = function () {
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
        var Black = [0, 0, 0];
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
        mShotPositions.push(new Shot(x, y, 2));
        drawHits(mShotPositions);

        /*if (this._hitsChangedEvent != null) {
            this._hitsChangedEvent(this, 42);
        }*/
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

        drawZoomed(ctx, mZoomCenterPos.x, mZoomCenterPos.y, mCurZoom);
        setHitGraphicsTransform(mZoomCenterPos.x, mZoomCenterPos.y, mCurZoom);
    }

    var TargetSegment = function (radius, marginWidth, text, segmentColor, marginColor, textColor) {
        this.radius = radius;
        this.marginWidth = marginWidth;
        this.text = text;
        this.segmentColor = segmentColor;
        this.marginColor = marginColor;
        this.textColor = textColor;
    }

    var Shot = function (xNormalized, yNormalized, score) {
        this.xNormalized = xNormalized;
        this.yNormalized = yNormalized;
        this.score = score;
    }

    return {
        initialize: initialize
    }
})();
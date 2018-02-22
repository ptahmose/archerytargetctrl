define(function () {
    const defaultMarginWidth = 0.01 / 2;
    const WhiteSegment = [226, 216, 217];
    const BlackSegment = [54, 49, 53];
    const BlueSegment = [68, 173, 228];
    const RedSegment = [231, 37, 35];
    const RedSegmentText = [176, 127, 113];
    const GoldSegment = [251, 209, 3];
    const GoldSegmentText = [165, 135, 11];
    const WhiteSegmentText = [111, 106, 103];
    const BlackSegmentText = [181, 177, 174];
    const BlueSegmentText = [0, 56, 85];
    const Black = [0, 0, 0];
    const White = [255, 255, 255];

    function isInsideCircle(centerX,centerY,radius,x,y)
    {
        var distSquared = (x-centerX)*(x-centerX)+(y-centerY)*(y-centerY);
        if (distSquared <= radius*radius/4) {
            return true;
        }

        return false;
    }

    
    var TargetSegment = function (radius, marginWidth, text, segmentColor, marginColor, textColor,score) {
        this.radius = radius;
        this.marginWidth = marginWidth;
        this.text = text;
        this.segmentColor = segmentColor;
        this.marginColor = marginColor;
        this.textColor = textColor;
        this.score = score;
    }

    function create3Spots()
    {
        const d = 0.01;
        const h = (1 - 2 * d) / 3;
        var tc=[];
        for (var i=0;i<3;++i){
            var c = {
                centerX: 0.5,
                centerY: i * h + (h / 2) + i * d,
                segments: [
                    new TargetSegment(h,
                        defaultMarginWidth,
                        "6",
                        BlueSegment,
                        Black,
                        BlueSegmentText,6),
                    new TargetSegment(h - 1 * (h) / 5,
                        defaultMarginWidth,
                        "7",
                        RedSegment,
                        Black,
                        RedSegmentText,7),
                    new TargetSegment(h - 2 * (h) / 5,
                        defaultMarginWidth,
                        "8",
                        RedSegment,
                        Black,
                        RedSegmentText,8),
                    new TargetSegment(h - 3 * (h) / 5,
                        defaultMarginWidth,
                        "9",
                        GoldSegment,
                        Black,
                        GoldSegmentText,9),
                    new TargetSegment(h - 4 * (h) / 5,
                        defaultMarginWidth,
                        "10",
                        GoldSegment,
                        Black,
                        GoldSegmentText,10)]
                    };
                tc.push(c);
            }
            
        return tc;
    }

    var targetCtrl_1To10 = [
        {
            centerX: 0.5, centerY: 0.5,
            segments: [
                new TargetSegment(1.0,
                    defaultMarginWidth,
                    "1",
                    WhiteSegment,        /* Segment color */
                    Black,               /* Margin color */
                    WhiteSegmentText,
                    1),   /* Text color */
                new TargetSegment(0.9,
                    defaultMarginWidth,
                    "2",
                    WhiteSegment,
                    Black,
                    WhiteSegmentText,
                    2),
                new TargetSegment(0.8,
                    defaultMarginWidth,
                    "3",
                    BlackSegment,
                    White,
                    BlackSegmentText,
                    3),
                new TargetSegment(0.7,
                    defaultMarginWidth,
                    "4",
                    BlackSegment,
                    White,
                    BlackSegmentText,
                    4),
                new TargetSegment(0.6,
                    defaultMarginWidth,
                    "5",
                    BlueSegment,
                    Black,
                    BlueSegmentText,
                    5),
                new TargetSegment(0.5,
                    defaultMarginWidth,
                    "6",
                    BlueSegment,
                    Black,
                    BlueSegmentText,
                    6),
                new TargetSegment(0.4,
                    defaultMarginWidth,
                    "7",
                    RedSegment,
                    Black,
                    RedSegmentText,
                    7),
                new TargetSegment(0.3,
                    defaultMarginWidth,
                    "8",
                    RedSegment,
                    Black,
                    RedSegmentText,
                    8),
                new TargetSegment(0.2,
                    defaultMarginWidth,
                    "9",
                    GoldSegment,
                    Black,
                    GoldSegmentText,
                    9),
                new TargetSegment(0.1,
                    defaultMarginWidth,
                    "10",
                    GoldSegment,
                    Black,
                    GoldSegmentText,
                    10)]
        }
    ];

    _3Spots= create3Spots();

    var targetControls =
    {
        '1To10':targetCtrl_1To10,
        '3Spots':_3Spots
    };


    return {
        determineScore:function(xNormalized,yNormalized,targetSegments){
            var targetSegmentsLength=targetSegments.length;
            for (var si = 0; si < targetSegmentsLength; ++si) {
                var segments = targetSegments[si];
                var segmentsSegmentsLength=segments.segments.length;
                var centerX=segments.centerX;
                var centerY=segments.centerY;
                for (var i=segmentsSegmentsLength-1;i>=0;i--){
                    var seg = segments.segments[i];
                    if (isInsideCircle(centerX,centerY,seg.radius,xNormalized,yNormalized))
                    {
                        return seg.score;
                    }
                }
            }

            return null;
        },

        getTarget:function(name){
            var val = targetControls[name];
            return val;
        }
    };
});
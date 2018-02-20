define(function () {

    function isInsideCircle(centerX,centerY,radius,x,y)
    {
        var distSquared = (x-centerX)*(x-centerX)+(y-centerY)*(y-centerY);
        if (distSquared <= radius*radius) {
            return true;
        }

        return false;
    }


    return {
        determineScore:function(xNormalized,yNormalized,targetDefinition){
            var targetSegmentsLength=targetSegments.length;
            for (var si = 0; si < targetSegmentsLength; ++si) {
                var segments = targetSegments[si];
                var segmentsSegmentsLength=segments.segments.length;
                var centerX=segments.centerX;
                var centerY=segments.centerY;
                for (var i=segmentsSegmentsLength-1;i>=0;i--){
                    if (isInsideCircle(centerX,centerY,segments.segments[i + 1].radius,xNormalized,yNormalized))
                    {
                        return segments.segments[i + 1].score;
                    }
                }
            }

            return null;
        }
    };
});
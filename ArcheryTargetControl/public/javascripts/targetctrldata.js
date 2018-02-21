define(function () {

    function isInsideCircle(centerX,centerY,radius,x,y)
    {
        var distSquared = (x-centerX)*(x-centerX)+(y-centerY)*(y-centerY);
        if (distSquared <= radius*radius/4) {
            return true;
        }

        return false;
    }


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
        }
    };
});
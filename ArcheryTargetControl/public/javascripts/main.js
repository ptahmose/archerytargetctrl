requirejs.config({
    baseUrl: '../javascripts',
    paths: {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery 1.9.0 located at
        // js/lib/jquery-1.9.0.js, relative to
        // the HTML page.
        jquery: 'lib/jquery',
    }
});

requirejs(["jquery","targetctrl2","resulttable2","targetctrldata"], 
    function($,targetControl,shotResultTable,targetctrldata) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".

    //window.onload = () => {
    $( function(){
        //var el =  $("#myCanvas");
        var el = document.getElementById('myCanvas');
        var svg = document.getElementById('mySvg');
        //var svg = $($(this).attr("mySvg"))[0];


        var div = document.getElementById('targetDiv');
        var w = div.getAttribute('width');
        var h = div.getAttribute('height');
        svg.setAttribute('width', w + 'px');
        svg.setAttribute('height', h + 'px');
        svg.style.width = w + 'px';
        svg.style.height = h + 'px';
        el.setAttribute('width', w + 'px');
        el.setAttribute('height', h + 'px');


        targetControl.initialize(
            'myCanvas',
            'mySvg',
            function(){
                //return targetctrldata.getTarget("1To10");
                return targetctrldata.getTarget("3Spots");
            });
        targetControl.on("hitsChanged",function(){console.log("HITS CHANGED");});
        // alert("HELLO");

        var tableElement = document.getElementById('resultTable');
        
        (function(){
        var table = shotResultTable.initialize(tableElement);
        //shotResultTable.onTableChanged({});
        var f = function(targetCtrl){table.onTableChanged(targetCtrl)};
        targetControl.on("hitsChanged",
        function(tableChgInfo){shotResultTable.onTableChanged(tableChgInfo);}
         );
        }());
       // (function(targetCtrl){table.onTableChanged(targetCtrl);}){}());
    });

    return;
});
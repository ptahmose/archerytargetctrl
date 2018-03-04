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
        tables:'http://cdn.datatables.net/v/dt/dt-1.10.16/datatables.min',
        tablespluginorderneutral:'https://cdn.datatables.net/plug-ins/1.10.16/api/order.neutral()'
        
    },
    shim:
    {
        tables:['jquery'],
        tablespluginorderneutral:['tables']
    }
});

requirejs(["jquery","targetctrl2","resulttable2","targetctrldata","tables"], 
    function($,targetControl,shotResultTable,targetctrldata,jqueryTables) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".

    function updateTargetSelectionCombobox(targetList){
        var combobox=$('#targetselectcombo');
        combobox.empty();
        $.each(targetList,function(i,p){
            combobox.append($('<option></option>').val(p).html(p));
        });

        /*var combobox=document.getElementById('targetselectcombo');
        combobox.c
        for (var i=0;i<targetList.length;++i)
        {
            var t=targetList[i];
            var el=document.createElement("option");
            el.textContent=t;
            el.value=t;
            combobox.appendChild(el);
        }*/
    }

    //window.onload = () => {
    $( function(){
        //$(document).on('touchmove', false);


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

        var targetName = "1To10";


        targetControl.initialize(
            'myCanvas',
            'mySvg',
            function(){
                //return targetctrldata.getTarget("1To10");
                return targetctrldata.getTarget(targetName/*"3Spots"*/);
            });
        targetControl.on("hitsChanged",function(){console.log("HITS CHANGED");});
        // alert("HELLO");

        var tableElement = document.getElementById('resultTable');
        
        //(function(){
        var table = shotResultTable.initialize(tableElement,
            function(i)
            {
                //console.log(i.toString());
                targetControl.setHitHilite(i);
            },
            function(i)
            {
                targetControl.deleteShot(i);
            });

        //shotResultTable.onTableChanged({});
        var f = function(targetCtrl){table.onTableChanged(targetCtrl)};
        targetControl.on("hitsChanged",
        function(tableChgInfo){shotResultTable.onTableChanged(tableChgInfo);}
         );
        //}());

        updateTargetSelectionCombobox(targetctrldata.getTargetList());
        $('#targetselectcombo').change(function(event,ui)
        {
            targetName=this.value;
            targetControl.notifyTargetControlDescriptionChanged();
            //console.log("SELECTED:"+this.value);
        });

       // (function(targetCtrl){table.onTableChanged(targetCtrl);}){}());

      /* $('#resultTable').DataTable({
            data:[
                new ResultTableRow(3,"ABC"),
                new ResultTableRow(4,"KOL"),
                new ResultTableRow(8,"OILKJ")
            ],
            columns:[
                { data:'score'},
                { data:'pos'}
            ]
       });*/
    
    });

    return;
});
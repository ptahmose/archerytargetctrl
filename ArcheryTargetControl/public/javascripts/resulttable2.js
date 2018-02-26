"use strict";
//var shotResultTable = (function () {
define(["require","jquery","tables","tablespluginorderneutral"],function (require,$,tables,tablespluginorderneutral){   
    
    //--------------------------------------------------------------------------------
    function ResultTableRow(id,score,pos)
    {
        this.id = id;
        this.score = score;
        this.pos = pos;
    }
    //--------------------------------------------------------------------------------

    var targetctrldata = require("targetctrldata");


    var mTable;
    var mData;
    var mHiliteShot;

    function updateSelectedRows(table,hiliteShotsFunc)
    {
        var a= [];
        $.each(table.rows('.selected').data(), function() {
            a.push(this.id);
            });

        hiliteShotsFunc(a);
        console.log("Length: "+a.length);
    }


    var initialize = function (htmlElement,funcHilite) {
        mHiliteShot=funcHilite;
        /*mHtmlElement = htmlElement;
        var row = mHtmlElement.insertRow(-1);
        var dataCell = row.insertCell(-1);
        dataCell.innerHTML = "ABC";
        dataCell = row.insertCell(-1);
        dataCell.innerHTML = "XYZ";*/
        mData=[
           /* new ResultTableRow(3,"ABC"),
            new ResultTableRow(4,"KOL"),
            new ResultTableRow(8,"OILKJ")*/
        ];

        //mTable=$('#resultTable');
        mTable=$('#resultTable').DataTable({
            data:mData,
            columns:[
                { data:'score'},
                { data:'pos'},
                {
                    data:'id',
                    orderable:false,
                    searchable: false,
                    render: function(data, type, full, meta)
                    {
                        if(type === 'display'){
                            return '<button class="btn-view" type="button">Delete</button>';
                        }

                        return data;
                    }
                }
            ]
      
       });

       mTable.on( 'click', 'tr', function () {
        var theRow = $(this).index();

        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            mTable.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            //mHiliteShot(theRow);
        }

        updateSelectedRows(mTable,mHiliteShot);
        });

        /*mTable.on('select.dt', function(e, dt, type, indexes) {
            return;
        });*/

        $('#clearTableSort').on('click',function(){
            mTable.order.neutral().draw();
        });

        //create your own click handler for the header
        // mTable.on( 'click', 'th', function (event) {
        //     /*var parent = $(event.target).parent();
        //     var myIndex = $(parent).prevAll().length;*/
        //     var col_idx =  mTable.column(this).index();

        //     var col = mTable.column(this);
        //     var order=mTable.order();

        //     console.log('Header '+col_idx+"  "+order+' clicked');
        //     //here you can trigger a custom event
        // });

    }

    var onTableChanged = function (tableChgInfo) {
        clearTableContent();
        /*var shotCtrl=tableChgInfo["targetcontrol"];
        var shots = shotCtrl.getShots();*/
        var getShotsFunc=tableChgInfo["getShots"];
        var shots=getShotsFunc();
        var targetSegments=tableChgInfo["getTargetSegments"]();
        addRows(shots,targetSegments);

        // this causes a "redraw" of the table -> https://stackoverflow.com/questions/27778389/how-to-manually-update-datatables-table-with-new-json-data
        mTable.clear().rows.add(mData).draw();

        //mTable.order.neutral().draw();
        //mTable.draw();
    }

    var clearTableContent=function(){
        mData=[];
        /*let start = mHtmlElement.rows.length - 1;
        if (start >= 1) {
            for (var i = start; i > 0; --i) {
                mHtmlElement.deleteRow(i);
            }
        }*/
    }

    var addRows=function(shots,segments){
        //shots.forEach(element => {
        var shotsLength=shots.length;
        for (var i=0;i<shotsLength;++i)
        {
            var element=shots[i];
            var score = targetctrldata.determineScore(element.xNormalized,element.yNormalized,segments);
            var pos = element.xNormalized+","+element.yNormalized;
            mData.push(new ResultTableRow(i,score,pos));
            /*var row = mHtmlElement.insertRow(-1);
            var dataCell = row.insertCell(-1);
            //dataCell.innerHTML = element.score.toString();
            var score = targetctrldata.determineScore(element.xNormalized,element.yNormalized,segments);
            dataCell.innerHTML = score!=null?score.toString():"M";
            dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.xNormalized+","+element.yNormalized;

            targetctrldata.determineScore(element.xNormalized,element.yNormalized,segments);*/
        };
    }


    return {
        initialize: initialize,
        onTableChanged: onTableChanged
    }
});
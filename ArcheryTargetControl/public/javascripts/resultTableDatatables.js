"use strict";
//var shotResultTable = (function () {
define(["require", "jquery", "tables"/*, "tablespluginorderneutral"*/], function (require, $, tables/*, tablespluginorderneutral*/) {

    // https://datatables.net/plug-ins/api/order.neutral()
    $.fn.dataTable.Api.register( 'order.neutral()', function () {
        return this.iterator( 'table', function ( s ) {
            s.aaSorting.length = 0;
            s.aiDisplay.sort( function (a,b) {
                return a-b;
            } );
            s.aiDisplayMaster.sort( function (a,b) {
                return a-b;
            } );
        } );
    } );

    //--------------------------------------------------------------------------------
    function ResultTableRow(id, score, element) {
        this.id = id;
        this.score = score;
        this.shotElement=element;
    }

    ResultTableRow.prototype.pos = function(){
        return this.shotElement.xNormalized.toString()+", "+this.shotElement.yNormalized.toString();
    }
    //--------------------------------------------------------------------------------

    var targetctrldata = require("targetctrldata");


    var mTable;
    var mData;
    var mHiliteShot;
    var mDeleteShot;

    function updateSelectedRows(table, hiliteShotsFunc) {
        var a = [];
        $.each(table.rows('.selected').data(), function () {
            a.push(this.id);
        });

        hiliteShotsFunc(a);
        console.log("Length: " + a.length);
    }


    var initialize = function (htmlElement, funcHilite, funcDeleteShot) {
        mHiliteShot = funcHilite;
        mDeleteShot = funcDeleteShot;
        /*mHtmlElement = htmlElement;
        var row = mHtmlElement.insertRow(-1);
        var dataCell = row.insertCell(-1);
        dataCell.innerHTML = "ABC";
        dataCell = row.insertCell(-1);
        dataCell.innerHTML = "XYZ";*/
        mData = [
            /*new ResultTableRow(3,"ABC"),
             new ResultTableRow(4,"KOL"),
             new ResultTableRow(8,"OILKJ")*/
        ];

        //mTable=$('#resultTable');
        mTable = $('#resultTable').DataTable({
            data: mData,
            columns: [
                {
                    className: 'details-control',
                    orderable: false,
                    searchable: false,
                    data:null,
                    defaultContent: '',
                    render: function () {
                        return '<i class="fa fa-plus-square" aria-hidden="true"></i>';
                    },
                    width: "15px"
                },
                { 
                    data: 'score' ,
                    title:"SCORE"
                },
              /*  { data: 'pos' },*/
                {
                    data: 'id',
                    orderable: false,
                    searchable: false,
                    render: function (data, type, full, meta) {
                        if (type === 'display') {
                            return '<button class="datatable-delete" type="button">Delete</button>';
                        }

                        return data;
                    }
                }
            ],
            "paging": false,
            "info":false,
            "searching":false
        });

        // that's important, otherwise the header is not correctly drawn
        mTable.order.neutral().draw();

        var lastSortCol,lastSortDir;

        mTable.on( 'order.dt', function (a,b) {
            if (b.aLastSort.length==0)return;
            if (lastSortCol!=null&&lastSortDir!=null)
            {
                if (lastSortCol==b.aLastSort[0].col&&lastSortDir=='desc'&&b.aLastSort[0].dir=='asc')
                {
                    mTable.order.neutral().draw();
                    lastSortCol=null;
                    lastSortDir=null;
                    return;
                }
            }

            if (b.aLastSort.length>0)
            {
            lastSortDir=b.aLastSort[0].dir;
            lastSortCol=b.aLastSort[0].col;
            }
            else{
                lastSortDir=null;
            lastSortCol=null;
            }
            // This will show: "Ordering on column 1 (asc)", for example
            //var order = mTable.order();
            //$('#orderInfo').html( 'Ordering on column '+order[0][0]+' ('+order[0][1]+')' );
        } );

        mTable.on('click', 'tr', function (e) {
            var theRow = $(this).index();

            if (!$(this).hasClass('details')) {
                var f = $(this).find('table');
                if (f != null && !f.hasClass('details')) {
                    // var firstChild =this.children[0];//.hasClass('details');
                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('selected');
                    }
                    else {
                        mTable.$('tr.selected').removeClass('selected');
                        $(this).addClass('selected');
                        //mHiliteShot(theRow);
                    }

                    updateSelectedRows(mTable, mHiliteShot);
                }
            }
/*            else {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }*/
        });

        mTable.on('click', 'tbody .datatable-delete', function (e) {
            var data = mTable.row($(this).parents('tr')).data();
            console.log("DELETE: id=" + data.id + " score:" + data.score);
            mDeleteShot(data.id);
            // https://stackoverflow.com/questions/5563783/jquery-class-click-multiple-elements-click-event-once
            e.stopPropagation();
            e.stopImmediatePropagation();
            return;
        });

        /*mTable.on('select.dt', function(e, dt, type, indexes) {
            return;
        });*/

        $('#clearTableSort').on('click', function () {
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

        function format(d) {
            // `d` is the original data object for the row
            var htmlText=
                '<table class="details" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
                '<tr class="details">' +
                '<td class="details">Id:</td>' +
                '<td class="details">' + d.id + '</td>' +
                '</tr>' +
                '<tr class="details">' +
                '<td class="details">Score:</td>' +
                '<td class="details">' + d.score + '</td>' +
                '</tr>' +
                '<tr class="details">' +
                '<td class="details">Position:</td>' +
                '<td class="details">' + d.pos() + '</td>' +
                '</tr>';
            if (d.shotElement.hasOwnProperty('datetime'))            {
                htmlText+=
                '<tr class="details">' +
                '<td class="details">Date-Time:</td>' +
                '<td class="details">' + d.shotElement.datetime + '</td>' +
                '</tr>';
            }
            htmlText+='</table>';
            return htmlText;
        }


        // Add event listener for opening and closing details
        $('#resultTable tbody').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var tdi = tr.find("i.fa");
            var row = mTable.row(tr);

            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
                tdi.first().removeClass('fa-minus-square');
                tdi.first().addClass('fa-plus-square');
            }
            else {
                // Open this row
                row.child(format(row.data())).show();
                tr.addClass('shown');
                tdi.first().removeClass('fa-plus-square');
                tdi.first().addClass('fa-minus-square');
            }
        });
    }

    var onTableChanged = function (tableChgInfo) {
        clearTableContent();
        /*var shotCtrl=tableChgInfo["targetcontrol"];
        var shots = shotCtrl.getShots();*/
        var getShotsFunc = tableChgInfo["getShots"];
        var shots = getShotsFunc();
        var targetSegments = tableChgInfo["getTargetSegments"]();
        addRows(shots, targetSegments);

        // this causes a "redraw" of the table -> https://stackoverflow.com/questions/27778389/how-to-manually-update-datatables-table-with-new-json-data
        mTable.clear().rows.add(mData).draw('full-reset');

        //mTable.order.neutral().draw();
        //mTable.draw();
    }

    var clearTableContent = function () {
        mData = [];
        /*let start = mHtmlElement.rows.length - 1;
        if (start >= 1) {
            for (var i = start; i > 0; --i) {
                mHtmlElement.deleteRow(i);
            }
        }*/
    }

    var addRows = function (shots, segments) {
        //shots.forEach(element => {
        var shotsLength = shots.length;
        for (var i = 0; i < shotsLength; ++i) {
            var element = shots[i];
            var score = targetctrldata.determineScore(element.xNormalized, element.yNormalized, segments);
            var pos = element.xNormalized + "," + element.yNormalized;
            mData.push(new ResultTableRow(i, score, element));
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
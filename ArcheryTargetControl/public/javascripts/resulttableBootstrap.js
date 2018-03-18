"use strict";
//var shotResultTable = (function () {
define(["require", "jquery", "bootstrap", "bstable"], function (require, $, bootstrap, bstable) {

    //--------------------------------------------------------------------------------
    function ResultTableRow(id, score, element) {
        this.id = id;
        this.score = score;
        this.shotElement = element;
    }

    ResultTableRow.prototype.pos = function () {
        return this.shotElement.xNormalized.toString() + ", " + this.shotElement.yNormalized.toString();
    }
    //--------------------------------------------------------------------------------

    var targetctrldata = require("targetctrldata");


    var mTable;
    var mData;
    var mHiliteShot;
    var mDeleteShot;

    function updateSelectedRows(table, hiliteShotsFunc) {
        /*var a = [];
        $.each(table.rows('.selected').data(), function () {
            a.push(this.id);
        });

        hiliteShotsFunc(a);
        console.log("Length: " + a.length);*/
        var s = table.bootstrapTable('getSelections');
        var a = [];
        if (s != null) {
            s.forEach(function (resultTableRow) {
                a.push(resultTableRow.id);
            });
        }

        hiliteShotsFunc(a);
    }

    function cellformatter(value, row, index, field) {
        var s = '<button class="datatable-delete" data-rowid="' + index.toString() +
            '"  type="button">Delete</button>';
        return s;

        //return '<button class="datatable-delete"  type="button">Delete</button>';

    }

    var initialize = function (selector, funcHilite, funcDeleteShot) {
        mHiliteShot = funcHilite;
        mDeleteShot = funcDeleteShot;

        mData = [
            /* new ResultTableRow(3,"ABC"),
             new ResultTableRow(4,"KOL"),
             new ResultTableRow(8,"OILKJ")*/
        ];

        //mTable=$('#resultTable');
        mTable = $(selector).bootstrapTable({
            data: mData,
            detailView:true,
            columns: [
                {
                    checkbox: true
                },
                {
                    field: 'score',
                    title: 'Score'
                }, {
                    formatter: function (value, row, index, field) { return row.pos(); },
                    title: 'Position',
                },
                {
                    title: 'Action',
                    formatter: cellformatter
                }
            ]
        });

        /*  $(selector).on('change', 'tr' , function (event) {
              if($('.selected')){
                  kode =$('.selected').closest('tr').find('td:eq(1)').text();
                  $("input").val(kode);
             }});*/


        $(selector).on('click-row.bs.table', function (e, row, $element) {
            //  console.log("onClickRow");
            //  if($(this).hasClass('active')){
            //     $(this).removeClass('active'); 
            //   } else {
            //     $(this).addClass('active').siblings().removeClass('active');
            //   }

            //updateSelectedRows(mTable, mHiliteShot);
            var index = row.id;//$element[0].rowIndex-1;

            var isSelected = false;
            var s = mTable.bootstrapTable('getSelections');
            for (var i = 0; i < s.length; ++i) {
                if (s[i].id == index) {
                    isSelected = true;
                    break;
                }
            }

            if (isSelected == false) {
                mTable.bootstrapTable('check', index);
            }
            else {
                mTable.bootstrapTable('uncheck', index);
            }
        });

        $(selector).on('check.bs.table uncheck.bs.table check-all.bs.table uncheck-all.bs.table', function (row, $element) {
            updateSelectedRows(mTable, mHiliteShot);
        });

        mTable.on('click', 'tbody .datatable-delete', function (e) {
            var rowId;
            var t = e.currentTarget;
            if (t != null) {
                rowId = parseInt(t.dataset.rowid);
            }

            if (rowId != null) {
                mDeleteShot(rowId);
            }

            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        mTable.on('expand-row.bs.table', function (e, index, row, $detail) {
            var s = format(row);
            $detail.html(s);
        });



        //     $(selector).on('all.bs.table', function (name,args) {
        //         //console.log(name, args);
        //    });

        // Fires when user click a row
        // $(selector).bootstrapTable({
        //     onClickRow: function (row, $element) {
        //         // row: the record corresponding to the clicked row, 
        //         // $element: the tr element.
        //         return;
        //     }
        // });


        /* mTable.on('click', 'tbody .datatable-delete', function (e) {
             var data = mTable.row($(this).parents('tr')).data();
             console.log("DELETE: id=" + data.id + " score:" + data.score);
             mDeleteShot(data.id);
             // https://stackoverflow.com/questions/5563783/jquery-class-click-multiple-elements-click-event-once
             e.stopPropagation();
             e.stopImmediatePropagation();
             return;
         });*/



        //         mTable.on('click', 'tr', function (e) {
        //             var theRow = $(this).index();

        //             if (!$(this).hasClass('details')) {
        //                 var f = $(this).find('table');
        //                 if (f != null && !f.hasClass('details')) {
        //                     // var firstChild =this.children[0];//.hasClass('details');
        //                     if ($(this).hasClass('selected')) {
        //                         $(this).removeClass('selected');
        //                     }
        //                     else {
        //                         mTable.$('tr.selected').removeClass('selected');
        //                         $(this).addClass('selected');
        //                         //mHiliteShot(theRow);
        //                     }

        //                     updateSelectedRows(mTable, mHiliteShot);
        //                 }
        //             }
        // /*            else {
        //                 e.stopPropagation();
        //                 e.stopImmediatePropagation();
        //             }*/
        //         });

        //         mTable.on('click', 'tbody .datatable-delete', function (e) {
        //             var data = mTable.row($(this).parents('tr')).data();
        //             console.log("DELETE: id=" + data.id + " score:" + data.score);
        //             mDeleteShot(data.id);
        //             // https://stackoverflow.com/questions/5563783/jquery-class-click-multiple-elements-click-event-once
        //             e.stopPropagation();
        //             e.stopImmediatePropagation();
        //             return;
        //         });

        //         /*mTable.on('select.dt', function(e, dt, type, indexes) {
        //             return;
        //         });*/

        //         $('#clearTableSort').on('click', function () {
        //             mTable.order.neutral().draw();
        //         });

        //         //create your own click handler for the header
        //         // mTable.on( 'click', 'th', function (event) {
        //         //     /*var parent = $(event.target).parent();
        //         //     var myIndex = $(parent).prevAll().length;*/
        //         //     var col_idx =  mTable.column(this).index();

        //         //     var col = mTable.column(this);
        //         //     var order=mTable.order();

        //         //     console.log('Header '+col_idx+"  "+order+' clicked');
        //         //     //here you can trigger a custom event
        //         // });

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


        //         // Add event listener for opening and closing details
        //         $('#resultTable tbody').on('click', 'td.details-control', function () {
        //             var tr = $(this).closest('tr');
        //             var tdi = tr.find("i.fa");
        //             var row = mTable.row(tr);

        //             if (row.child.isShown()) {
        //                 // This row is already open - close it
        //                 row.child.hide();
        //                 tr.removeClass('shown');
        //                 tdi.first().removeClass('fa-minus-square');
        //                 tdi.first().addClass('fa-plus-square');
        //             }
        //             else {
        //                 // Open this row
        //                 row.child(format(row.data())).show();
        //                 tr.addClass('shown');
        //                 tdi.first().removeClass('fa-plus-square');
        //                 tdi.first().addClass('fa-minus-square');
        //             }
        //         });
    }

    var onTableChanged = function (tableChgInfo) {
        clearTableContent();
        /*var shotCtrl=tableChgInfo["targetcontrol"];
        var shots = shotCtrl.getShots();*/
        var getShotsFunc = tableChgInfo["getShots"];
        var shots = getShotsFunc();
        var targetSegments = tableChgInfo["getTargetSegments"]();
        addRows(shots, targetSegments);

        // this causes a "redraw" of the table -> https://github.com/wenzhixin/bootstrap-table-examples/blob/master/methods/load.html
        mTable.bootstrapTable('load', mData);
    }

    var clearTableContent = function () {
        mData = [];
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
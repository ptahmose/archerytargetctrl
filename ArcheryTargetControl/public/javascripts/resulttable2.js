"use strict";
//var shotResultTable = (function () {
define(["require","jquery","tables"],function (require,$,tables){   
    
    //--------------------------------------------------------------------------------
    function ResultTableRow(score,pos)
    {
        this.score = score;
        this.pos = pos;
    }
    //--------------------------------------------------------------------------------

    var targetctrldata = require("targetctrldata");


    var mTable;
    var mData;

    var initialize = function (htmlElement) {
        /*mHtmlElement = htmlElement;
        var row = mHtmlElement.insertRow(-1);
        var dataCell = row.insertCell(-1);
        dataCell.innerHTML = "ABC";
        dataCell = row.insertCell(-1);
        dataCell.innerHTML = "XYZ";*/
        mData=[
            new ResultTableRow(3,"ABC"),
            new ResultTableRow(4,"KOL"),
            new ResultTableRow(8,"OILKJ")
        ];

        //mTable=$('#resultTable');
        mTable=$('#resultTable').DataTable({
            data:mData,
            columns:[
                { data:'score'},
                { data:'pos'}
            ]
       });
    }

    var onTableChanged = function (tableChgInfo) {
        clearTableContent();
        /*var shotCtrl=tableChgInfo["targetcontrol"];
        var shots = shotCtrl.getShots();*/
        var getShotsFunc=tableChgInfo["getShots"];
        var shots=getShotsFunc();
        var targetSegments=tableChgInfo["getTargetSegments"]();
        addRows(shots,targetSegments);

        mTable.clear().rows.add(mData).draw();
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
        shots.forEach(element => {
            var score = targetctrldata.determineScore(element.xNormalized,element.yNormalized,segments);
            var pos = element.xNormalized+","+element.yNormalized;
            mData.push(new ResultTableRow(score,pos));
            /*var row = mHtmlElement.insertRow(-1);
            var dataCell = row.insertCell(-1);
            //dataCell.innerHTML = element.score.toString();
            var score = targetctrldata.determineScore(element.xNormalized,element.yNormalized,segments);
            dataCell.innerHTML = score!=null?score.toString():"M";
            dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.xNormalized+","+element.yNormalized;

            targetctrldata.determineScore(element.xNormalized,element.yNormalized,segments);*/
        });
    }


    return {
        initialize: initialize,
        onTableChanged: onTableChanged
    }
});
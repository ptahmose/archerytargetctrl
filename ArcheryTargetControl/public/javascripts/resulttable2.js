"use strict";
//var shotResultTable = (function () {
define(function (require){    

    var targetctrldata = require("targetctrldata");


    var mHtmlElement;

    var initialize = function (htmlElement) {
        mHtmlElement = htmlElement;
        var row = mHtmlElement.insertRow(-1);
        var dataCell = row.insertCell(-1);
        dataCell.innerHTML = "ABC";
        dataCell = row.insertCell(-1);
        dataCell.innerHTML = "XYZ";
    }

    var onTableChanged = function (tableChgInfo) {
        clearTableContent();
        /*var shotCtrl=tableChgInfo["targetcontrol"];
        var shots = shotCtrl.getShots();*/
        var getShotsFunc=tableChgInfo["getShots"];
        var shots=getShotsFunc();
        var targetSegments=tableChgInfo["getTargetSegments"]();
        addRows(shots,targetSegments);
    }

    var clearTableContent=function(){
        let start = mHtmlElement.rows.length - 1;
        if (start >= 1) {
            for (var i = start; i > 0; --i) {
                mHtmlElement.deleteRow(i);
            }
        }
    }

    var addRows=function(shots,segments){
        shots.forEach(element => {
            var row = mHtmlElement.insertRow(-1);
            var dataCell = row.insertCell(-1);
            //dataCell.innerHTML = element.score.toString();
            var score = targetctrldata.determineScore(element.xNormalized,element.yNormalized,segments);
            dataCell.innerHTML = score!=null?score.toString():"M";
            dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.xNormalized+","+element.yNormalized;

            targetctrldata.determineScore(element.xNormalized,element.yNormalized,segments);
        });
    }


    return {
        initialize: initialize,
        onTableChanged: onTableChanged
    }
});
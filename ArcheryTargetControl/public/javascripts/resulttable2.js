//var shotResultTable = (function () {
define(function (){    

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
        addRows(shots);
    }

    var clearTableContent=function(){
        let start = mHtmlElement.rows.length - 1;
        if (start >= 1) {
            for (var i = start; i > 0; --i) {
                mHtmlElement.deleteRow(i);
            }
        }
    }

    var addRows=function(shots){
        shots.forEach(element => {
            var row = mHtmlElement.insertRow(-1);
            var dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.score.toString();
            dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.xNormalized+","+element.yNormalized;
        });
    }


    return {
        initialize: initialize,
        onTableChanged: onTableChanged
    }
});
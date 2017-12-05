var ShotResultTable = /** @class */ (function () {
    function ShotResultTable(element) {
        this.element = element;
        var row = this.element.insertRow(-1);
        var dataCell = row.insertCell(-1);
        dataCell.innerHTML = "ABC";
        dataCell = row.insertCell(-1);
        dataCell.innerHTML = "XYZ";
    }
    ShotResultTable.prototype.OnTableChanged = function (targetCtrl, dummy) {
        this.ClearTableContent();
        var shots = targetCtrl.getShots();
        this.AddRows(shots);
    };
    ShotResultTable.prototype.ClearTableContent = function () {
        var start = this.element.rows.length - 1;
        if (start >= 1) {
            for (var i = start; i > 0; --i) {
                this.element.deleteRow(i);
            }
        }
    };
    ShotResultTable.prototype.AddRows = function (shots) {
        var _this = this;
        shots.forEach(function (element) {
            var row = _this.element.insertRow(-1);
            var dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.x.toString();
            dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.y.toString();
        });
    };
    return ShotResultTable;
}());
//# sourceMappingURL=resulttable.js.map
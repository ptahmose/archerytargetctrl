var ShotResultTable = /** @class */ (function () {
    function ShotResultTable(element) {
        this.element = element;
        var row = this.element.insertRow(-1);
        var dataCell = row.insertCell(-1);
        dataCell.innerHTML = "ABC";
        dataCell = row.insertCell(-1);
        dataCell.innerHTML = "XYZ";
    }
    ShotResultTable.prototype.OnTableChanged = function () {
        return;
    };
    return ShotResultTable;
}());
//# sourceMappingURL=resulttable.js.map
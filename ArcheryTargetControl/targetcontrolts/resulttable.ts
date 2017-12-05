

class ShotResultTable {
    element: HTMLTableElement;

    constructor(element: HTMLTableElement) {
        this.element = element;
        var row = this.element.insertRow(-1);
        var dataCell = row.insertCell(-1);
        dataCell.innerHTML = "ABC";
        dataCell = row.insertCell(-1);
        dataCell.innerHTML = "XYZ";
    }

    public OnTableChanged(targetCtrl: TargetCtrl, dummy: number): void {
        this.ClearTableContent();
        let shots = targetCtrl.getShots();
        this.AddRows(shots);
    }

    private ClearTableContent(): void {
        let start = this.element.rows.length - 1;
        if (start >= 1) {
            for (var i = start; i > 0; --i) {
                this.element.deleteRow(i);
            }
        }
    }

    private AddRows(shots: { x: number, y: number }[]): void {
        shots.forEach(element => {
            var row = this.element.insertRow(-1);
            var dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.x.toString();
            dataCell = row.insertCell(-1);
            dataCell.innerHTML = element.y.toString();
        });
    }
}
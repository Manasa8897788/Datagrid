import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (
    data: any[],
    columns: { code: string; name: string }[],
    filename = "DataTableExport"
) => {
    const doc = new jsPDF('landscape');

    const tableColumnHeaders = columns.map(col => col.name);
    const tableRows = data.map(row =>
        columns.map(col => {
            const cell = row[col.code];
            return typeof cell === "string" || typeof cell === "number"
                ? cell.toString()
                : JSON.stringify(cell);
        })
    );

    autoTable(doc, {
        head: [tableColumnHeaders],
        body: tableRows,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: 'center',
            fontSize: 9,
            overflow: 'linebreak', // ensures long header labels wrap
        },
        columnStyles: Object.fromEntries(
            columns.map((col, index) => [
                index,
                {
                    cellWidth: 'wrap', // allows label and data wrapping
                    minCellWidth: 30,
                    maxCellWidth: 100,
                }
            ])
        ),
        margin: { top: 20, bottom: 10 },
        startY: 30,
        didDrawPage: (data) => {
            doc.setFontSize(12);
            doc.text("Exported Data Table", data.settings.margin.left, 15);
        },
        pageBreak: 'auto',
    });

    doc.save(`${filename}.pdf`);
};

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (
  data: any[],
  columns: { code: string; name: string }[],
  filename = "DataTableExport"
) => {
  const doc = new jsPDF("landscape", "mm", "a4");

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
      fontSize: 5.5,
      cellPadding: 1,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: 'center',
      fontSize: 6.5,
      overflow: 'ellipsize',
    },
    columnStyles: Object.fromEntries(
      columns.map((col, index) => [
        index,
        {
          cellWidth: 'wrap', 
          minCellWidth: 20,
          maxCellWidth: 50
        }
      ])
    ),
    margin: { top: 20, bottom: 10, left: 5, right: 5 },
    startY: 30,
    tableWidth: 'wrap', 
    horizontalPageBreak: true, 
    showHead: 'everyPage',
    didDrawPage: (data) => {
      doc.setFontSize(11);
      doc.text("Exported Data Table", data.settings.margin.left, 15);
    },
    pageBreak: 'auto',
  });

  doc.save(`${filename}.pdf`);
};

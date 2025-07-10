import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (
  data: any[],
  columns: { title: string; code: string }[],
  fileName: string = "ExportedData"
) => {
  const formattedData = data.map((row) => {
    const formattedRow: { [key: string]: any } = {};
    columns.forEach((col) => {
      formattedRow[col.title] = row[col.code];
    });
    return formattedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${fileName}.xlsx`);
};

import * as XLSX from 'xlsx';

export interface ReportingSheet {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

export function exportReportingToExcel(sheets: ReportingSheet[], filename = 'reporting-bscva') {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sheet.headers, ...sheet.rows]);
    // Excel limite les noms d'onglet à 31 caractères.
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
  }
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

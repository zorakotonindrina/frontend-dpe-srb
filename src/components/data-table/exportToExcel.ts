import * as XLSX from 'xlsx';
import type { Table } from '@tanstack/react-table';

export function exportToExcel<TData>(table: Table<TData>, filename = 'export') {
  const cols = table.getVisibleFlatColumns().filter(
    (col) => !['actions', 'select'].includes(col.id) && col.getIsVisible(),
  );

  const headers = cols.map((col) => {
    const h = col.columnDef.header;
    return typeof h === 'string' ? h : col.id;
  });

  const rows = table.getFilteredRowModel().rows.map((row) =>
    cols.map((col) => {
      const val = row.getValue(col.id);
      return val ?? '';
    }),
  );

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Export');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

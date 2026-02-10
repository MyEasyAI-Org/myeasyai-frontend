// =============================================
// SpreadsheetConversionService - Spreadsheet Format Conversions (SRP)
// =============================================
// Converts between XLSX, CSV, and JSON using the xlsx library.
// =============================================

import * as XLSX from 'xlsx';

export const SpreadsheetConversionService = {
  async xlsxToCsv(blob: Blob, sheetIndex: number = 0): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[sheetIndex];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_csv(worksheet);
  },

  async csvToXlsx(csvText: string, sheetName: string = 'Sheet1'): Promise<Blob> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(
      csvText.split('\n').map(row => row.split(','))
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },

  async xlsxToJson(blob: Blob, sheetIndex: number = 0): Promise<object[]> {
    const arrayBuffer = await blob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[sheetIndex];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  },

  async jsonToXlsx(data: object[], sheetName: string = 'Sheet1'): Promise<Blob> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },
};

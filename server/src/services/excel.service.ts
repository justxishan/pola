import ExcelJS from 'exceljs';

export class ExcelService {
  /**
   * Generate an Excel spreadsheet from rows and column definitions
   */
  static async generateExcelBuffer(
    sheetName: string,
    columns: Array<{ header: string; key: string; width?: number }>,
    rows: any[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Pola Platform';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = columns.map((c) => ({
      header: c.header,
      key: c.key,
      width: c.width || 20,
    }));

    // Header styling
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D6A4F' }, // Pola Forest Green
    };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add rows
    sheet.addRows(rows);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

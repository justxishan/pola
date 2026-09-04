import PDFDocument from 'pdfkit';
import { IOrder } from '../models/Order.model.js';

export class PdfService {
  /**
   * Generate an official PDF Tax/Purchase Invoice for an Order
   */
  static generateInvoicePdf(order: IOrder): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header
      doc
        .fontSize(22)
        .fillColor('#2d6a4f')
        .text('POLA (පොළ) — Agricultural Marketplace', { align: 'left' });
      doc
        .fontSize(10)
        .fillColor('#555555')
        .text('Dambulla Agritech Digital Network, Sri Lanka', { align: 'left' });
      doc.moveDown();

      // Divider
      doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.8);

      // Invoice Details
      doc.fontSize(14).fillColor('#1b4332').text(`INVOICE: ${order.orderNumber}`);
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`);
      doc.text(`Customer: ${order.recipientName} (${order.recipientPhone})`);
      doc.text(`Status: ${order.status.toUpperCase()} | Payment: ${order.paymentStatus.toUpperCase()}`);
      doc.text(
        `Delivery Destination: ${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}, ${order.deliveryAddress.district}`
      );
      doc.moveDown();

      // Items Table Header
      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#2d6a4f');
      doc.text('Item Description', 40, tableTop);
      doc.text('Quantity', 260, tableTop, { width: 80, align: 'right' });
      doc.text('Unit Price (LKR)', 350, tableTop, { width: 90, align: 'right' });
      doc.text('Total (LKR)', 450, tableTop, { width: 100, align: 'right' });

      doc.moveDown(0.4);
      doc.strokeColor('#dddddd').lineWidth(0.5).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.4);

      // Items Rows
      let yPosition = doc.y;
      doc.fontSize(9).fillColor('#333333');
      for (const item of order.items) {
        doc.text(`${item.productName} [${item.category}]`, 40, yPosition);
        doc.text(`${item.quantityOrdered} ${item.unit}`, 260, yPosition, { width: 80, align: 'right' });
        doc.text(`${item.unitPrice.toFixed(2)}`, 350, yPosition, { width: 90, align: 'right' });
        doc.text(`${item.subtotal.toFixed(2)}`, 450, yPosition, { width: 100, align: 'right' });
        yPosition += 18;
      }

      doc.moveDown();
      doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, yPosition + 5).lineTo(550, yPosition + 5).stroke();

      // Summary
      const summaryTop = yPosition + 15;
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Items Subtotal:`, 320, summaryTop);
      doc.text(`LKR ${order.itemsTotal.toFixed(2)}`, 450, summaryTop, { width: 100, align: 'right' });

      doc.text(`Delivery Fee:`, 320, summaryTop + 16);
      doc.text(`LKR ${order.totalDeliveryFee.toFixed(2)}`, 450, summaryTop + 16, { width: 100, align: 'right' });

      doc.fontSize(12).fillColor('#1b4332').text(`Grand Total Paid:`, 320, summaryTop + 36);
      doc.text(`LKR ${order.grandTotal.toFixed(2)}`, 450, summaryTop + 36, { width: 100, align: 'right' });

      // Footer
      doc
        .fontSize(8)
        .fillColor('#888888')
        .text(
          'Thank you for supporting Sri Lankan farmers through Pola. For inquiries, contact support@pola.lk',
          40,
          750,
          { align: 'center', width: 510 }
        );

      doc.end();
    });
  }

  /**
   * Generate an official PDF Table Report from rows and column definitions
   */
  static generateTablePdf(
    title: string,
    columns: Array<{ header: string; key: string; width?: number }>,
    rows: any[]
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers: Buffer[] = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header Banner
      doc
        .fontSize(18)
        .fillColor('#2d6a4f')
        .text(`POLA (\u0db4\u0ddc\u0dc5) \u2014 ${title}`, 30, 30);
      doc
        .fontSize(9)
        .fillColor('#666666')
        .text(`Generated: ${new Date().toLocaleString('en-GB')} | Pola Agritech Platform`, 30, 52);

      // Divider
      doc.strokeColor('#cccccc').lineWidth(0.75).moveTo(30, 68).lineTo(812, 68).stroke();

      // Compute column positions
      const totalWidth = 782; // 842 - 60
      const totalCustomWidth = columns.reduce((acc, col) => acc + (col.width || 20), 0);
      const colWidths = columns.map((col) => Math.floor(((col.width || 20) / totalCustomWidth) * totalWidth));

      const drawTableHeader = (yPos: number) => {
        doc.rect(30, yPos, totalWidth, 20).fill('#2d6a4f');
        let currentX = 35;
        doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold');
        columns.forEach((col, idx) => {
          doc.text(col.header, currentX, yPos + 6, { width: colWidths[idx] - 6 });
          currentX += colWidths[idx];
        });
        doc.font('Helvetica');
      };

      let y = 80;
      drawTableHeader(y);
      y += 24;

      doc.fontSize(8).fillColor('#333333');
      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];

        if (y > 530) {
          doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
          y = 30;
          drawTableHeader(y);
          y += 24;
          doc.fontSize(8).fillColor('#333333');
        }

        // Alternating background
        if (r % 2 === 1) {
          doc.rect(30, y - 2, totalWidth, 16).fill('#f8f9fa');
        }

        let currentX = 35;
        doc.fillColor('#222222');
        columns.forEach((col, idx) => {
          const val = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '';
          doc.text(val, currentX, y + 2, { width: colWidths[idx] - 6 });
          currentX += colWidths[idx];
        });

        y += 16;
      }

      doc.end();
    });
  }
}

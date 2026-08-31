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
}

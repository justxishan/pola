import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order.model.js';
import { WastageLog } from '../models/WastageLog.model.js';
import { ExcelService } from '../services/excel.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { ReportType } from '@pola/shared';

export class ReportController {
  /**
   * Generate System Reports in Excel
   */
  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType, startDate, endDate, format = 'excel' } = req.query as any;

      if (reportType === ReportType.WASTAGE_SUMMARY) {
        const filter: any = {};
        if (startDate && endDate) {
          filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const logs = await WastageLog.find(filter)
          .populate('farmerId', 'fullName phone')
          .sort({ createdAt: -1 });

        const columns = [
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Crop Name', key: 'productName', width: 20 },
          { header: 'Category', key: 'category', width: 15 },
          { header: 'Farmer', key: 'farmer', width: 25 },
          { header: 'Quantity (kg)', key: 'quantityKg', width: 15 },
          { header: 'Estimated Loss (LKR)', key: 'estimatedLossLkr', width: 20 },
          { header: 'Stage Caught', key: 'stageCaught', width: 20 },
          { header: 'Reason', key: 'reason', width: 20 },
          { header: 'Disposition', key: 'disposition', width: 20 },
        ];

        const rows = logs.map((l) => ({
          date: new Date(l.createdAt).toLocaleDateString(),
          productName: l.productName,
          category: l.category,
          farmer: (l.farmerId as any)?.fullName || 'N/A',
          quantityKg: l.quantityKg,
          estimatedLossLkr: l.estimatedLossLkr,
          stageCaught: l.stageCaught,
          reason: l.reason,
          disposition: l.disposition,
        }));

        const buffer = await ExcelService.generateExcelBuffer('Wastage Report', columns, rows);

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=Pola-Wastage-Report-${Date.now()}.xlsx`
        );
        return res.send(buffer);
      }

      if (reportType === ReportType.FARMER_INCOME) {
        const farmerId = req.user!.userId;
        const orders = await Order.find({
          'items.farmerId': farmerId,
          status: 'completed',
        }).sort({ createdAt: -1 });

        const columns = [
          { header: 'Order Number', key: 'orderNumber', width: 22 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Crop', key: 'productName', width: 20 },
          { header: 'Qty Sold', key: 'quantity', width: 15 },
          { header: 'Gross Revenue (LKR)', key: 'grossRevenue', width: 20 },
          { header: 'Platform Fee (LKR)', key: 'platformFee', width: 18 },
          { header: 'Net Payout (LKR)', key: 'netPayout', width: 18 },
        ];

        const rows = [];
        for (const order of orders) {
          for (const item of order.items) {
            if (item.farmerId.toString() === farmerId) {
              rows.push({
                orderNumber: order.orderNumber,
                date: new Date(order.createdAt).toLocaleDateString(),
                productName: item.productName,
                quantity: `${item.quantityOrdered} ${item.unit}`,
                grossRevenue: item.subtotal,
                platformFee: item.platformCommissionLkr || 0,
                netPayout: item.farmerPayoutLkr || item.subtotal,
              });
            }
          }
        }

        const buffer = await ExcelService.generateExcelBuffer('Farmer Income Report', columns, rows);

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=Pola-Income-Report-${Date.now()}.xlsx`
        );
        return res.send(buffer);
      }

      throw new AppError('Unsupported report type requested', 400);
    } catch (error) {
      next(error);
    }
  }
}

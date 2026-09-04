import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order.model.js';
import { WastageLog } from '../models/WastageLog.model.js';
import { QualityInspection } from '../models/QualityInspection.model.js';
import { ExcelService } from '../services/excel.service.js';
import { PdfService } from '../services/pdf.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { ReportType } from '@pola/shared';

export class ReportController {
  /**
   * Generate System Reports in Excel or PDF
   */
  static async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType, startDate, endDate, format = 'excel' } = req.query as any;

      let reportTitle = 'System Report';
      let columns: Array<{ header: string; key: string; width?: number }> = [];
      let rows: any[] = [];

      if (reportType === ReportType.WASTAGE_SUMMARY) {
        const filter: any = {};
        if (startDate && endDate) {
          filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const logs = await WastageLog.find(filter)
          .populate('farmerId', 'fullName phone')
          .sort({ createdAt: -1 });

        reportTitle = 'Wastage & Spoilage Report';
        columns = [
          { header: 'Date', key: 'date', width: 14 },
          { header: 'Crop Name', key: 'productName', width: 20 },
          { header: 'Category', key: 'category', width: 15 },
          { header: 'Farmer', key: 'farmer', width: 22 },
          { header: 'Quantity (kg)', key: 'quantityKg', width: 14 },
          { header: 'Estimated Loss (LKR)', key: 'estimatedLossLkr', width: 20 },
          { header: 'Stage Caught', key: 'stageCaught', width: 18 },
          { header: 'Reason', key: 'reason', width: 18 },
          { header: 'Disposition', key: 'disposition', width: 18 },
        ];

        rows = logs.map((l) => ({
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
      } else if (reportType === ReportType.FARMER_INCOME) {
        const farmerId = req.user!.userId;
        const orders = await Order.find({
          'items.farmerId': farmerId,
          status: 'completed',
        }).sort({ createdAt: -1 });

        reportTitle = 'Farmer Income Statement';
        columns = [
          { header: 'Order Number', key: 'orderNumber', width: 22 },
          { header: 'Date', key: 'date', width: 14 },
          { header: 'Crop', key: 'productName', width: 20 },
          { header: 'Qty Sold', key: 'quantity', width: 14 },
          { header: 'Gross Revenue (LKR)', key: 'grossRevenue', width: 20 },
          { header: 'Platform Fee (LKR)', key: 'platformFee', width: 18 },
          { header: 'Net Payout (LKR)', key: 'netPayout', width: 18 },
        ];

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
      } else if (reportType === ReportType.HUB_COLLECTION) {
        const filter: any = { stage: 'hub_intake' };
        if (startDate && endDate) {
          filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const inspections = await QualityInspection.find(filter)
          .populate('farmerId', 'fullName phone')
          .populate('productId', 'productName category unit')
          .populate('hubId', 'name district')
          .populate('inspectorId', 'fullName')
          .sort({ createdAt: -1 });

        reportTitle = 'Hub Intake Collection Log';
        columns = [
          { header: 'Date', key: 'date', width: 14 },
          { header: 'Village Hub', key: 'hubName', width: 20 },
          { header: 'Farmer', key: 'farmer', width: 22 },
          { header: 'Crop', key: 'productName', width: 20 },
          { header: 'Self Grade', key: 'selfGrade', width: 12 },
          { header: 'Assigned Grade', key: 'assignedGrade', width: 14 },
          { header: 'Listed Qty', key: 'listedQty', width: 14 },
          { header: 'Confirmed Qty', key: 'confirmedQty', width: 14 },
          { header: 'Variance %', key: 'variance', width: 12 },
          { header: 'Inspector', key: 'inspector', width: 18 },
        ];

        rows = inspections.map((i) => ({
          date: new Date(i.createdAt).toLocaleDateString(),
          hubName: (i.hubId as any)?.name || 'Regional Hub',
          farmer: (i.farmerId as any)?.fullName || 'N/A',
          productName: (i.productId as any)?.productName || 'Produce',
          selfGrade: i.selfDeclaredGrade?.toUpperCase() || 'A',
          assignedGrade: i.assignedGrade?.toUpperCase() || 'A',
          listedQty: i.listedQuantity || 0,
          confirmedQty: i.confirmedQuantity || 0,
          variance: `${i.weightVariancePercent || 0}%`,
          inspector: (i.inspectorId as any)?.fullName || 'Hub Officer',
        }));
      } else if (reportType === ReportType.COLLECTOR_COMMISSION) {
        const filter: any = {
          status: 'completed',
        };
        if (startDate && endDate) {
          filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const orders = await Order.find(filter)
          .populate('items.collectorId', 'fullName phone')
          .populate('linkedVillageHubId', 'name district')
          .sort({ createdAt: -1 });

        reportTitle = 'Village Collector Commission Statement';
        columns = [
          { header: 'Date', key: 'date', width: 14 },
          { header: 'Order Number', key: 'orderNumber', width: 22 },
          { header: 'Collector', key: 'collector', width: 22 },
          { header: 'Village Hub', key: 'hub', width: 18 },
          { header: 'Crop', key: 'productName', width: 20 },
          { header: 'Qty Collected', key: 'quantity', width: 14 },
          { header: 'Commission (LKR)', key: 'commission', width: 18 },
        ];

        for (const order of orders) {
          for (const item of order.items) {
            if (item.collectorCommissionLkr && item.collectorCommissionLkr > 0) {
              rows.push({
                date: new Date(order.createdAt).toLocaleDateString(),
                orderNumber: order.orderNumber,
                collector: (item.collectorId as any)?.fullName || 'Village Collector',
                hub: (order.linkedVillageHubId as any)?.name || 'N/A',
                productName: item.productName,
                quantity: `${item.quantityCollected || item.quantityOrdered} ${item.unit}`,
                commission: item.collectorCommissionLkr,
              });
            }
          }
        }
      } else {
        throw new AppError('Unsupported report type requested', 400);
      }

      if (format.toLowerCase() === 'pdf') {
        const buffer = await PdfService.generateTablePdf(reportTitle, columns, rows);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=Pola-${reportType.replace(/_/g, '-')}-${Date.now()}.pdf`
        );
        return res.send(buffer);
      }

      const buffer = await ExcelService.generateExcelBuffer(reportTitle, columns, rows);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Pola-${reportType.replace(/_/g, '-')}-${Date.now()}.xlsx`
      );
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

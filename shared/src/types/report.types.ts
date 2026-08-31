export enum ReportType {
  FARMER_INCOME = 'farmer_income',
  HUB_COLLECTION = 'hub_collection',
  COLLECTOR_COMMISSION = 'collector_commission',
  B2B_PURCHASE_HISTORY = 'b2b_purchase_history',
  CUSTOMER_INVOICE = 'customer_invoice',
  DELIVERY_PAYOUT = 'delivery_payout',
  VEHICLE_LOG = 'vehicle_log',
  ADMIN_GMV_REVENUE = 'admin_gmv_revenue',
  QUALITY_DISPUTE_SUMMARY = 'quality_dispute_summary',
  WASTAGE_SUMMARY = 'wastage_summary',
  LOGISTICS_EFFICIENCY = 'logistics_efficiency',
  DC_INVENTORY_THROUGHPUT = 'dc_inventory_throughput',
}

export interface ReportFilter {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  distributionCenterId?: string;
  villageHubId?: string;
  farmerId?: string;
  collectorId?: string;
  driverId?: string;
  format: 'pdf' | 'excel' | 'json';
}

import { OrderStatus } from '../enums/OrderStatus.enum.js';

export interface OrderStateConfig {
  status: OrderStatus;
  stepNumber: number;
  labelEn: string;
  labelSi: string;
  labelTa: string;
  description: string;
}

export const ORDER_LIFECYCLE_STEPS: OrderStateConfig[] = [
  {
    status: OrderStatus.PLACED,
    stepNumber: 1,
    labelEn: 'Order Placed',
    labelSi: 'ඇණවුම භාරගන්නා ලදී',
    labelTa: 'ஆர்டர் வைக்கப்பட்டது',
    description: 'Order placed by buyer and logged in Pola system',
  },
  {
    status: OrderStatus.PAYMENT_CONFIRMED,
    stepNumber: 2,
    labelEn: 'Payment Confirmed',
    labelSi: 'ගෙවීම තහවුරු විය',
    labelTa: 'பணம் செலுத்தப்பட்டது',
    description: 'Payment authorized and held in Pola Escrow',
  },
  {
    status: OrderStatus.AWAITING_HUB_COLLECTION,
    stepNumber: 3,
    labelEn: 'Awaiting Hub Collection',
    labelSi: 'හබ් එකතුව අපේක්ෂාවෙන්',
    labelTa: 'ஹப் சேகரிப்புக்காக காத்திருக்கிறது',
    description: 'Farmer packaging produce for Village Hub drop-off',
  },
  {
    status: OrderStatus.COLLECTED_AT_HUB,
    stepNumber: 4,
    labelEn: 'Collected at Village Hub',
    labelSi: 'ග්‍රාමීය හබ් එකට ලැබුණි',
    labelTa: 'கிராமப்புற ஹப்பில் பெறப்பட்டது',
    description: 'Produce weighted, graded and checked in at Village Hub',
  },
  {
    status: OrderStatus.IN_TRANSIT_TO_DC,
    stepNumber: 5,
    labelEn: 'In Transit to DC',
    labelSi: 'බෙදාහැරීමේ මධ්‍යස්ථානය වෙත',
    labelTa: 'விநியோக மையத்திற்கு கொண்டு செல்லப்படுகிறது',
    description: 'Leg-1 Logistics transporting crates to Regional DC',
  },
  {
    status: OrderStatus.RECEIVED_AT_DC,
    stepNumber: 6,
    labelEn: 'Sorted at DC',
    labelSi: 'මධ්‍යස්ථානයේදී වර්ග කෙරුණි',
    labelTa: 'விநியோக மையத்தில் வரிசைப்படுத்தப்பட்டது',
    description: 'Received, inspected and sorted into customer delivery batches',
  },
  {
    status: OrderStatus.ASSIGNED_FOR_DELIVERY,
    stepNumber: 7,
    labelEn: 'Driver Assigned',
    labelSi: 'රියදුරු පැවරිණි',
    labelTa: 'டெலிவரி ஓட்டுநர் நியமிக்கப்பட்டார்',
    description: 'Leg-2 Last-mile delivery partner assigned to delivery run',
  },
  {
    status: OrderStatus.OUT_FOR_DELIVERY,
    stepNumber: 8,
    labelEn: 'Out for Delivery',
    labelSi: 'බෙදාහැරීමට රැගෙන යයි',
    labelTa: 'டெலிவரிக்கு புறப்பட்டது',
    description: 'Driver on route to buyer delivery location',
  },
  {
    status: OrderStatus.DELIVERED,
    stepNumber: 9,
    labelEn: 'Delivered',
    labelSi: 'භාණ්ඩ භාරදෙන ලදී',
    labelTa: 'டெலிவரி செய்யப்பட்டது',
    description: 'Buyer confirmed handover via OTP proof-of-delivery',
  },
  {
    status: OrderStatus.COMPLETED,
    stepNumber: 10,
    labelEn: 'Completed',
    labelSi: 'සම්පූර්ණයි',
    labelTa: 'முழுமை பெற்றது',
    description: 'Escrow released and split to farmer and delivery partner wallets',
  },
];

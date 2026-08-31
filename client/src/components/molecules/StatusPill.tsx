import React from 'react';
import { Badge, BadgeProps } from '@/components/atoms/Badge';
import { OrderStatus, QualityGrade, PaymentStatus, VerificationStatus } from '@pola/shared';

export interface StatusPillProps {
  status: OrderStatus | QualityGrade | PaymentStatus | VerificationStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md', className }) => {
  const getVariantAndLabel = (s: string): { variant: BadgeProps['variant']; label: string } => {
    switch (s) {
      // Order Statuses
      case OrderStatus.COMPLETED:
      case OrderStatus.DELIVERED:
        return { variant: 'emerald', label: s.replace(/_/g, ' ') };
      case OrderStatus.OUT_FOR_DELIVERY:
      case OrderStatus.IN_TRANSIT_TO_DC:
      case OrderStatus.ASSIGNED_FOR_DELIVERY:
        return { variant: 'sky', label: s.replace(/_/g, ' ') };
      case OrderStatus.PLACED:
      case OrderStatus.PAYMENT_CONFIRMED:
      case OrderStatus.AWAITING_HUB_COLLECTION:
      case OrderStatus.COLLECTED_AT_HUB:
      case OrderStatus.RECEIVED_AT_DC:
        return { variant: 'amber', label: s.replace(/_/g, ' ') };
      case OrderStatus.CANCELLED:
      case OrderStatus.REJECTED_AT_QUALITY_CHECK:
      case OrderStatus.DISPUTED:
        return { variant: 'rose', label: s.replace(/_/g, ' ') };

      // Quality Grades
      case QualityGrade.GRADE_A:
        return { variant: 'emerald', label: 'Grade A (100%)' };
      case QualityGrade.GRADE_B:
        return { variant: 'sky', label: 'Grade B (90%)' };
      case QualityGrade.GRADE_C:
        return { variant: 'amber', label: 'Grade C (75%)' };
      case QualityGrade.REJECTED:
        return { variant: 'rose', label: 'Rejected' };

      // Verification / KYC
      case VerificationStatus.VERIFIED:
        return { variant: 'emerald', label: 'Verified' };
      case VerificationStatus.PENDING:
        return { variant: 'amber', label: 'Under Review' };
      case VerificationStatus.REJECTED:
        return { variant: 'rose', label: 'Rejected' };
      case VerificationStatus.UNVERIFIED:
        return { variant: 'slate', label: 'Unverified' };

      // Payment
      case PaymentStatus.HELD_IN_ESCROW:
        return { variant: 'sky', label: 'Held in Escrow' };
      case PaymentStatus.RELEASED:
        return { variant: 'emerald', label: 'Released' };
      case PaymentStatus.REFUNDED:
        return { variant: 'purple', label: 'Refunded' };

      default:
        return { variant: 'slate', label: s.replace(/_/g, ' ') };
    }
  };

  const { variant, label } = getVariantAndLabel(status);

  return (
    <Badge variant={variant} size={size} hasDot className={className}>
      <span className="capitalize">{label}</span>
    </Badge>
  );
};

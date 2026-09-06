import { z } from 'zod';
import { ProductCategory, UnitOfSale, QualityGrade } from '@pola/shared';

export const CreateProductSchema = z.object({
  body: z.object({
    farmId: z.string().min(1, 'Farm ID is required'),
    productName: z.string().min(2, 'Product name is required'),
    category: z.nativeEnum(ProductCategory).default(ProductCategory.VEGETABLE),
    variety: z.string().optional(),
    unit: z.nativeEnum(UnitOfSale).default(UnitOfSale.KG),
    // z.coerce handles FormData strings AND proper JSON numbers
    basePricePerUnit: z.coerce.number().min(0).default(0),
    availableQuantity: z.coerce.number().min(0).default(0),
    minOrderQuantity: z.coerce.number().min(1).default(1),
    status: z.enum(['draft', 'pending_verification', 'active', 'out_of_stock', 'delisted']).optional(),
    isDraft: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().default(false)
    ),
    saveAsDraft: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().default(false)
    ),
    b2bPricingTiers: z.preprocess(
      (val) => {
        let list = val;
        if (typeof val === 'string') {
          try { list = JSON.parse(val); } catch { list = []; }
        }
        if (Array.isArray(list)) {
          return list.map((t: any) => ({
            minQuantity: t.minQuantity,
            maxQuantity: t.maxQuantity,
            unitPrice: t.unitPrice !== undefined ? t.unitPrice : t.pricePerUnit,
          }));
        }
        return [];
      },
      z.array(
        z.object({
          minQuantity: z.coerce.number().min(1),
          maxQuantity: z.coerce.number().optional(),
          unitPrice: z.coerce.number().min(0.1),
        })
      ).default([])
    ),
    selfDeclaredGrade: z.nativeEnum(QualityGrade).default(QualityGrade.GRADE_A),
    isOrganic: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().default(false)
    ),
    requiresColdChain: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().default(false)
    ),
    seasonTag: z.enum(['maha', 'yala', 'year_round']).default('year_round'),
    harvestDate: z.string().optional(),
    shelfLifeDays: z.coerce.number().optional(),
    images: z.preprocess(
      (val) => (typeof val === 'string' ? [val] : val ?? []),
      z.array(z.string()).default([])
    ),
    description: z.string().optional(),
  }).superRefine((data, ctx) => {
    const isDraftSubmission = data.isDraft || data.saveAsDraft || data.status === 'draft';
    if (!isDraftSubmission) {
      if (data.basePricePerUnit <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Price must be greater than 0',
          path: ['basePricePerUnit'],
        });
      }
      if (data.availableQuantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Available quantity must be greater than 0',
          path: ['availableQuantity'],
        });
      }
      if (data.minOrderQuantity > data.availableQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Minimum order quantity cannot exceed available quantity',
          path: ['minOrderQuantity'],
        });
      }
    }
  }),
});

export const ProductQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    farmId: z.string().optional(),
    farmerId: z.string().optional(),
    search: z.string().optional(),
    category: z.nativeEnum(ProductCategory).optional(),
    district: z.string().optional(),
    isOrganic: z.string().optional().transform((val) => val === 'true'),
    isOrganicOnly: z.string().optional().transform((val) => val === 'true'),
    qualityGrade: z.string().optional(),
    minRating: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    requiresColdChain: z.string().optional().transform((val) => val === 'true'),
    minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    season: z.enum(['maha', 'yala', 'year_round']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    sort: z.string().optional(),
  }),
});

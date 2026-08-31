import { z } from 'zod';
import { ProductCategory, UnitOfSale, QualityGrade } from '@pola/shared';

export const CreateProductSchema = z.object({
  body: z.object({
    farmId: z.string().min(1, 'Farm ID is required'),
    productName: z.string().min(2, 'Product name is required'),
    category: z.nativeEnum(ProductCategory),
    variety: z.string().optional(),
    unit: z.nativeEnum(UnitOfSale).default(UnitOfSale.KG),
    basePricePerUnit: z.number().min(1, 'Price must be greater than 0'),
    availableQuantity: z.number().min(0.1, 'Available quantity must be greater than 0'),
    minOrderQuantity: z.number().min(1).default(1),
    b2bPricingTiers: z
      .array(
        z.object({
          minQuantity: z.number().min(1),
          maxQuantity: z.number().optional(),
          unitPrice: z.number().min(0.1),
        })
      )
      .default([]),
    selfDeclaredGrade: z.nativeEnum(QualityGrade).default(QualityGrade.GRADE_A),
    isOrganic: z.boolean().default(false),
    requiresColdChain: z.boolean().default(false),
    seasonTag: z.enum(['maha', 'yala', 'year_round']).default('year_round'),
    harvestDate: z.string().optional(),
    shelfLifeDays: z.number().optional(),
    images: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

export const ProductQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    search: z.string().optional(),
    category: z.nativeEnum(ProductCategory).optional(),
    district: z.string().optional(),
    isOrganic: z.string().optional().transform((val) => val === 'true'),
    minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
    season: z.enum(['maha', 'yala', 'year_round']).optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

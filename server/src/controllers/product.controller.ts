import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product.model.js';
import { Farm } from '../models/Farm.model.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { AppError } from '../middleware/error.middleware.js';

export class ProductController {
  /**
   * Create a new crop listing (Farmer / Collector)
   */
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.userId;
      const {
        farmId,
        productName,
        category,
        variety,
        unit,
        basePricePerUnit,
        availableQuantity,
        minOrderQuantity,
        b2bPricingTiers,
        selfDeclaredGrade,
        isOrganic,
        requiresColdChain,
        seasonTag,
        harvestDate,
        shelfLifeDays,
        images,
        description,
      } = req.body;

      const farm = await Farm.findOne({ _id: farmId, farmerId });
      if (!farm) {
        throw new AppError('Farm not found or does not belong to you', 404);
      }

      const product = await Product.create({
        farmerId,
        farmId,
        productName,
        category,
        variety,
        unit,
        basePricePerUnit,
        availableQuantity,
        minOrderQuantity: minOrderQuantity || 1,
        b2bPricingTiers: b2bPricingTiers || [],
        selfDeclaredGrade: selfDeclaredGrade || 'grade_a',
        isOrganic: isOrganic || farm.isOrganicCertified,
        requiresColdChain: requiresColdChain || false,
        seasonTag: seasonTag || 'year_round',
        harvestDate,
        shelfLifeDays,
        images: images || [],
        description,
        status: 'active',
      });

      res.status(201).json({
        success: true,
        message: 'Product listed successfully on Pola Marketplace',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all products of the authenticated farmer
   */
  static async getMyProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.userId;
      const { status } = req.query;

      const filter: any = { farmerId };
      if (status) filter.status = status;

      const products = await Product.find(filter)
        .populate('farmId', 'farmName district province')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { products },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Public Marketplace Catalog with Faceted Filters
   */
  static async getPublicCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        category,
        district,
        isOrganic,
        minPrice,
        maxPrice,
        season,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as any;

      const filter: any = { status: 'active', availableQuantity: { $gt: 0 } };

      if (search) {
        filter.$text = { $search: search };
      }
      if (category) {
        filter.category = category;
      }
      if (isOrganic !== undefined) {
        filter.isOrganic = isOrganic;
      }
      if (season) {
        filter.seasonTag = season;
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.basePricePerUnit = {};
        if (minPrice !== undefined) filter.basePricePerUnit.$gte = minPrice;
        if (maxPrice !== undefined) filter.basePricePerUnit.$lte = maxPrice;
      }

      const skip = (page - 1) * limit;
      const sortConfig: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('farmerId', 'fullName profileImage kycStatus')
          .populate('farmId', 'farmName district province gps')
          .sort(sortConfig)
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: {
          products,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Product Details by ID
   */
  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewsCount: 1 } },
        { new: true }
      )
        .populate('farmerId', 'fullName profileImage phone kycStatus rating')
        .populate('farmId', 'farmName addressLine city district province gps isOrganicCertified');

      if (!product) throw new AppError('Product not found', 404);

      res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Product Listing
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.userId;
      const product = await Product.findOne({ _id: req.params.id, farmerId });
      if (!product) throw new AppError('Product not found or unauthorized', 404);

      const updates = { ...req.body };
      if (updates.title && !updates.productName) updates.productName = updates.title;
      if (updates.pricePerUnit !== undefined && updates.basePricePerUnit === undefined) {
        updates.basePricePerUnit = updates.pricePerUnit;
      }
      if (updates.season && !updates.seasonTag) updates.seasonTag = updates.season;
      if (updates.pricingTiers && !updates.b2bPricingTiers) updates.b2bPricingTiers = updates.pricingTiers;
      if (updates.isActive !== undefined && !updates.status) {
        updates.status = updates.isActive ? 'active' : 'delisted';
      }

      Object.assign(product, updates);
      await product.save();

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload Product Images to Cloudinary
   */
  static async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new AppError('No image files provided', 400);
      }

      const uploadPromises = files.map((file) =>
        CloudinaryService.uploadBuffer(file.buffer, 'pola/products')
      );
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map((r) => r.secure_url);

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: { imageUrls },
      });
    } catch (error) {
      next(error);
    }
  }
}

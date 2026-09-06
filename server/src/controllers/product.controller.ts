import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Product } from '../models/Product.model.js';
import { Farm } from '../models/Farm.model.js';
import { User } from '../models/User.model.js';
import { Role, VerificationStatus } from '@pola/shared';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { uploadFilesToCloudinary } from '../utils/uploadFiles.util.js';
import { Wishlist } from '../models/Wishlist.model.js';
import { NotificationService } from '../services/notification.service.js';
import { logger } from '../utils/logger.util.js';
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
        status: requestedStatus,
        isDraft,
        saveAsDraft,
      } = req.body;

      const farm = await Farm.findOne({ _id: farmId, farmerId });
      if (!farm) {
        throw new AppError('Farm not found or does not belong to you', 404);
      }

      // Upload any multipart image files sent via Multer
      const files = req.files as Express.Multer.File[];
      const uploadedUrls = await uploadFilesToCloudinary(files, 'pola/products');

      // Merge newly uploaded Cloudinary URLs with any pre-uploaded/existing image URLs
      let finalImages: string[] = [...uploadedUrls];
      if (Array.isArray(images)) {
        finalImages = [...finalImages, ...images.filter((img) => typeof img === 'string' && img.trim().length > 0)];
      } else if (typeof images === 'string' && images.trim().length > 0) {
        finalImages.push(images.trim());
      }

      const isDraftSubmission =
        isDraft === true ||
        isDraft === 'true' ||
        saveAsDraft === true ||
        saveAsDraft === 'true' ||
        requestedStatus === 'draft';
      const initialStatus = isDraftSubmission
        ? 'draft'
        : farm.verificationStatus === 'verified'
        ? 'active'
        : 'pending_verification';

      const product = await Product.create({
        farmerId,
        farmId,
        district: farm.district,
        productName,
        category,
        variety,
        unit: unit || 'kg',
        basePricePerUnit: basePricePerUnit !== undefined ? Number(basePricePerUnit) : 0,
        availableQuantity: availableQuantity !== undefined ? Number(availableQuantity) : 0,
        minOrderQuantity: minOrderQuantity || 1,
        b2bPricingTiers: b2bPricingTiers || [],
        selfDeclaredGrade: selfDeclaredGrade || 'grade_a',
        isOrganic: isOrganic || farm.isOrganicCertified,
        requiresColdChain: requiresColdChain || false,
        seasonTag: seasonTag || 'year_round',
        harvestDate,
        shelfLifeDays,
        images: finalImages,
        description,
        status: initialStatus,
      });

      res.status(201).json({
        success: true,
        message: isDraftSubmission
          ? 'Draft crop listing saved successfully'
          : 'Product listed successfully on Pola Marketplace',
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
      const { status, farmId } = req.query as any;

      const filter: any = { farmerId };
      if (status) filter.status = status;
      if (farmId) filter.farmId = farmId;

      const products = await Product.find(filter)
        .populate('farmId', 'farmName district province verificationStatus')
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
        farmerId,
        category,
        district,
        isOrganic,
        isOrganicOnly,
        qualityGrade,
        minRating,
        requiresColdChain,
        minPrice,
        maxPrice,
        season,
        sort,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as any;

      const andClauses: any[] = [{ status: 'active', availableQuantity: { $gt: 0 } }];

      if (farmerId && Types.ObjectId.isValid(farmerId)) {
        andClauses.push({ farmerId: new Types.ObjectId(farmerId) });
      }

      if (search && search.trim()) {
        const clean = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(clean, 'i');
        andClauses.push({
          $or: [
            { productName: searchRegex },
            { variety: searchRegex },
            { description: searchRegex },
          ],
        });
      }

      if (category) {
        andClauses.push({ category });
      }

      if (district) {
        const matchingFarms = await Farm.find({
          district: { $regex: new RegExp(`^${district.trim()}$`, 'i') },
        }).select('_id');
        const farmIds = matchingFarms.map((f) => f._id);

        andClauses.push({
          $or: [
            { district: { $regex: new RegExp(`^${district.trim()}$`, 'i') } },
            { farmId: { $in: farmIds } },
          ],
        });
      }

      const organicFlag = isOrganicOnly !== undefined ? isOrganicOnly : isOrganic;
      if (organicFlag !== undefined) {
        andClauses.push({ isOrganic: organicFlag });
      }

      if (qualityGrade) {
        andClauses.push({ selfDeclaredGrade: qualityGrade });
      }

      if (requiresColdChain !== undefined) {
        andClauses.push({ requiresColdChain });
      }

      if (minRating !== undefined) {
        andClauses.push({ averageRating: { $gte: minRating } });
      }

      if (season) {
        andClauses.push({ seasonTag: season });
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceFilter: any = {};
        if (minPrice !== undefined) priceFilter.$gte = minPrice;
        if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
        andClauses.push({ basePricePerUnit: priceFilter });
      }

      const filter = andClauses.length > 1 ? { $and: andClauses } : andClauses[0];

      const skip = (page - 1) * limit;

      let sortConfig: any = { createdAt: -1 };
      const effectiveSort = sort || sortBy;
      if (effectiveSort === 'price_asc') {
        sortConfig = { basePricePerUnit: 1 };
      } else if (effectiveSort === 'price_desc') {
        sortConfig = { basePricePerUnit: -1 };
      } else if (effectiveSort === 'rating') {
        sortConfig = { averageRating: -1, ratingCount: -1 };
      } else if (effectiveSort === 'newest') {
        sortConfig = { createdAt: -1 };
      } else if (effectiveSort === 'featured') {
        sortConfig = { isOrganic: -1, createdAt: -1 };
      } else if (sortBy && sortOrder) {
        sortConfig = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
      }

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

      if (
        updates.isDraft === true ||
        updates.isDraft === 'true' ||
        updates.saveAsDraft === true ||
        updates.saveAsDraft === 'true' ||
        updates.status === 'draft'
      ) {
        updates.status = 'draft';
      } else if (
        updates.publish === true ||
        updates.publish === 'true' ||
        updates.status === 'active' ||
        (product.status === 'draft' && (updates.isDraft === false || updates.saveAsDraft === false))
      ) {
        const farm = await Farm.findById(updates.farmId || product.farmId);
        updates.status = farm && farm.verificationStatus === 'verified'
          ? 'active'
          : 'pending_verification';
      }

      const oldPrice = product.basePricePerUnit;
      const oldAvailable = product.availableQuantity;

      Object.assign(product, updates);
      await product.save();

      const newPrice = product.basePricePerUnit;
      const newAvailable = product.availableQuantity;
      const priceDropped = oldPrice > 0 && newPrice < oldPrice;
      const backInStock = oldAvailable === 0 && newAvailable > 0;

      if (priceDropped || backInStock) {
        Wishlist.find({ 'items.productId': product._id })
          .select('userId')
          .then((wishlists) => {
            for (const w of wishlists) {
              const title = priceDropped
                ? `Price Drop Alert: ${product.productName}`
                : `Back in Stock: ${product.productName}`;
              const message = priceDropped
                ? `Good news! ${product.productName} is now LKR ${newPrice} per ${product.unit} (was LKR ${oldPrice}).`
                : `${product.productName} is back in stock with ${newAvailable} ${product.unit} available!`;

              NotificationService.sendNotification({
                userId: w.userId,
                title,
                message,
                type: 'system',
                portal: 'customer',
                linkUrl: `/product/${product._id}`,
              });
            }
          })
          .catch((err) => {
            logger.error(`Failed to send wishlist notifications: ${err.message}`);
          });
      }

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

  /**
   * Public catalog statistics for Hero & Discovery
   * GET /api/products/stats
   */
  static async getPublicStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [totalActiveListings, verifiedFarmers, activeDistricts] = await Promise.all([
        Product.countDocuments({ status: 'active', availableQuantity: { $gt: 0 } }),
        User.countDocuments({
          role: Role.FARMER,
          kycStatus: VerificationStatus.VERIFIED,
        }),
        Product.distinct('district', { status: 'active', availableQuantity: { $gt: 0 } }),
      ]);

      const validDistricts = activeDistricts.filter(
        (d: any) => typeof d === 'string' && d.trim().length > 0
      );

      let farmerCount = verifiedFarmers;
      if (farmerCount === 0) {
        farmerCount = await User.countDocuments({ role: Role.FARMER });
      }

      res.status(200).json({
        success: true,
        data: {
          totalListings: totalActiveListings,
          totalFarmers: farmerCount,
          totalDistricts: validDistricts.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

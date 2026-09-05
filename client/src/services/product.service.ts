import { api } from './api';

export interface CatalogQueryFilters {
  category?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganicOnly?: boolean;
  isOrganic?: boolean;
  qualityGrade?: string;
  minRating?: number;
  requiresColdChain?: boolean;
  search?: string;
  sort?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const ProductService = {
  getCatalog: async (filters: CatalogQueryFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.district) params.append('district', filters.district);
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters.isOrganicOnly || filters.isOrganic) params.append('isOrganicOnly', 'true');
    if (filters.qualityGrade) params.append('qualityGrade', filters.qualityGrade);
    if (filters.minRating !== undefined) params.append('minRating', String(filters.minRating));
    if (filters.requiresColdChain !== undefined) params.append('requiresColdChain', String(filters.requiresColdChain));
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    return api.get(`/products/catalog?${params.toString()}`);
  },

  getProductById: async (id: string) => {
    return api.get(`/products/${id}`);
  },

  /** Public aggregate stats for hero header */
  getStats: async (): Promise<{
    totalListings: number;
    totalFarmers: number;
    totalDistricts: number;
  }> => {
    const res: any = await api.get('/products/stats');
    return res.data || res;
  },

  /** Create product with image file uploads via multipart/form-data */
  createProduct: async (formData: FormData) => {
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Create product without direct file upload via JSON */
  createProductJson: async (data: {
    farmId: string;
    productName: string;
    category: string;
    unit?: string;
    basePricePerUnit: number;
    availableQuantity: number;
    minOrderQuantity?: number;
    isOrganic?: boolean;
    seasonTag?: string;
    images?: string[];
    description?: string;
  }) => {
    return api.post('/products', data);
  },

  getMyProducts: async (params?: { farmId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.farmId) searchParams.append('farmId', params.farmId);
    if (params?.status) searchParams.append('status', params.status);
    const query = searchParams.toString();
    return api.get(`/products/farmer/my-products${query ? `?${query}` : ''}`);
  },

  updateProduct: async (id: string, data: any) => {
    return api.patch(`/products/${id}`, data);
  },

  deleteProduct: async (id: string) => {
    return api.delete(`/products/${id}`);
  },
};

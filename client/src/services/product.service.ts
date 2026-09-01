import { api } from './api';

export interface CatalogQueryFilters {
  category?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  isOrganicOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const ProductService = {
  getCatalog: async (filters: CatalogQueryFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.district) params.append('district', filters.district);
    if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters.isOrganicOnly) params.append('isOrganicOnly', 'true');
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    return api.get(`/products/catalog?${params.toString()}`);
  },

  getProductById: async (id: string) => {
    return api.get(`/products/${id}`);
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

  getMyProducts: async () => {
    return api.get('/products/farmer/my-products');
  },

  updateProduct: async (id: string, data: any) => {
    return api.patch(`/products/${id}`, data);
  },

  deleteProduct: async (id: string) => {
    return api.delete(`/products/${id}`);
  },
};

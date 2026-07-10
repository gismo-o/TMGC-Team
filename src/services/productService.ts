import { Product, ProductDraft } from '../types';
import { openBeautyFactsService } from './openBeautyFactsService';
import { apiFetch } from './apiClient';
import { API_PRODUCTS_URL } from './apiConfig';

type ScanInput = {
  barcode?: string;
  imageData?: unknown;
};

const toRequest = (product: Omit<Product, 'id'> | Partial<Product>) => ({
  name: product.name,
  brand: product.brand,
  category: product.category,
  timeOfDay: product.timeOfDay,
  imageUrl: product.imageUrl || '',
  cutoutImageUrl: product.cutoutImageUrl || undefined,
  description: product.description || null,
  expiryDate: product.expiryDate || null,
  activeIngredients: product.activeIngredients ?? [],
  isFavorite: product.isFavorite ?? false,
});

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    return apiFetch<Product[]>(API_PRODUCTS_URL);
  },

  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    return apiFetch<Product>(API_PRODUCTS_URL, {
      method: 'POST',
      body: toRequest(product),
    });
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    return apiFetch<Product>(`${API_PRODUCTS_URL}/${id}`, {
      method: 'PUT',
      body: toRequest(product),
    });
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await apiFetch<void>(`${API_PRODUCTS_URL}/${id}`, {
      method: 'DELETE',
    });
    return true;
  },

  scanProduct: async (input: ScanInput | string): Promise<ProductDraft | null> => {
    const scanInput: ScanInput = typeof input === 'string' ? { imageData: input } : input;

    if (scanInput.barcode) {
      try {
        const product = await openBeautyFactsService.getProductByBarcode(scanInput.barcode);
        if (product) return product;
      } catch (error) {
        console.warn('Open Beauty Facts lookup failed, using fallback product:', error);
      }
    }

    return null;
  },
};

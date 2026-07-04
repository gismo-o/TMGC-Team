import { Product, ProductDraft } from '../types';
import { openBeautyFactsService } from './openBeautyFactsService';

type ScanInput = {
  barcode?: string;
  imageData?: unknown;
};

const fallbackProduct: ProductDraft = {
  brand: 'The Ordinary',
  name: 'Niacinamide 10% + Zinc 1%',
  category: 'Serum',
  timeOfDay: 'both',
  imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
  description: 'Leke görünümünü azaltan ve sebum dengeleyen serum.',
  activeIngredients: ['Niacinamide', 'Zinc PCA'],
  expiryDate: '2027-01',
};

export const productService = {
  getProducts: async () => {
    // Sprint 2: Read the user's product closet from Spring Boot product API.
    console.log('productService.getProducts called');
    return Promise.resolve([] as Product[]);
  },
  addProduct: async (product: Omit<Product, 'id'>) => {
    // Sprint 2: Persist the product through Spring Boot product API.
    console.log('productService.addProduct called with:', product);
    return Promise.resolve({ ...product, id: Math.random().toString() } as Product);
  },
  updateProduct: async (id: string, product: Partial<Product>) => {
    // Sprint 2: Persist product edits through Spring Boot product API.
    console.log('productService.updateProduct called with id:', id, 'data:', product);
    return Promise.resolve({ id, ...product } as Product);
  },
  deleteProduct: async (id: string) => {
    // Sprint 2: Delete the product through Spring Boot product API.
    console.log('productService.deleteProduct called with id:', id);
    return Promise.resolve(true);
  },
  scanProduct: async (input: ScanInput | string): Promise<ProductDraft> => {
    const scanInput: ScanInput = typeof input === 'string' ? { imageData: input } : input;
    console.log('productService.scanProduct called with:', scanInput);

    if (scanInput.barcode) {
      try {
        const product = await openBeautyFactsService.getProductByBarcode(scanInput.barcode);
        if (product) return product;
      } catch (error) {
        console.warn('Open Beauty Facts lookup failed, using fallback product:', error);
      }
    }

    return Promise.resolve(fallbackProduct);
  }
};

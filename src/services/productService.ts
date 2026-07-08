import { supabase } from './supabaseClient';
import { Product, ProductDraft } from '../types';
import { openBeautyFactsService } from './openBeautyFactsService';

type ScanInput = {
  barcode?: string;
  imageData?: unknown;
};

const fallbackProduct: ProductDraft = {
  brand: 'La Roche-Posay',
  name: 'Effaclar duo+',
  category: 'Serum',
  timeOfDay: 'both',
  imageUrl: '',
  cutoutImageUrl: 'local:la-roche-effaclar-kplus',
  description: 'Niacinamide, Zinc PCA ve salisilik asit içeren hedefli bakım ürünü.',
  activeIngredients: ['Niacinamide', 'Zinc PCA', 'Salicylic Acid'],
  expiryDate: '2027-01',
};

const fromRow = (row: any): Product => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  category: row.category,
  timeOfDay: row.time_of_day,
  imageUrl: row.image_url ?? '',
  cutoutImageUrl: row.cutout_image_url ?? undefined,
  description: row.description ?? '',
  expiryDate: row.expiry_date ?? undefined,
  activeIngredients: row.active_ingredients ?? [],
  isFavorite: row.is_favorite ?? false,
});

const toRow = (product: Omit<Product, 'id'>, userId: string) => ({
  user_id: userId,
  name: product.name,
  brand: product.brand,
  category: product.category,
  time_of_day: product.timeOfDay,
  image_url: product.imageUrl || null,
  cutout_image_url: product.cutoutImageUrl || null,
  description: product.description || null,
  expiry_date: product.expiryDate || null,
  active_ingredients: product.activeIngredients ?? [],
  is_favorite: product.isFavorite ?? false,
});

const requireUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Ürün işlemleri için giriş yapılmış olmalı.');
  return data.user.id;
};

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },

  addProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('products')
      .insert(toRow(product, userId))
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const userId = await requireUserId();
    const updates: Record<string, unknown> = {};
    if (product.name !== undefined) updates.name = product.name;
    if (product.brand !== undefined) updates.brand = product.brand;
    if (product.category !== undefined) updates.category = product.category;
    if (product.timeOfDay !== undefined) updates.time_of_day = product.timeOfDay;
    if (product.imageUrl !== undefined) updates.image_url = product.imageUrl;
    if (product.cutoutImageUrl !== undefined) updates.cutout_image_url = product.cutoutImageUrl;
    if (product.description !== undefined) updates.description = product.description;
    if (product.expiryDate !== undefined) updates.expiry_date = product.expiryDate;
    if (product.activeIngredients !== undefined) updates.active_ingredients = product.activeIngredients;
    if (product.isFavorite !== undefined) updates.is_favorite = product.isFavorite;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const userId = await requireUserId();
    const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  scanProduct: async (input: ScanInput | string): Promise<ProductDraft> => {
    const scanInput: ScanInput = typeof input === 'string' ? { imageData: input } : input;

    if (scanInput.barcode) {
      try {
        const product = await openBeautyFactsService.getProductByBarcode(scanInput.barcode);
        if (product) return product;
      } catch (error) {
        console.warn('Open Beauty Facts lookup failed, using fallback product:', error);
      }
    }

    return Promise.resolve(fallbackProduct);
  },
};
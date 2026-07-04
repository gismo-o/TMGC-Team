
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../types';
import { productService } from '../services/productService';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  loadProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'demo-1',
      name: 'Effaclar duo+',
      brand: 'La Roche-Posay',
      category: 'Serum',
      timeOfDay: 'both',
      imageUrl: '',
      cutoutImageUrl: 'local:la-roche-effaclar-kplus',
      description: 'Open Beauty Facts verisine göre niacinamide, Zinc PCA ve salisilik asit içeren hedefli bakım ürünü.',
      activeIngredients: ['Niacinamide', 'Zinc PCA', 'Salicylic Acid'],
      expiryDate: '2027-03'
    },
    {
      id: 'demo-2',
      name: 'Ultra Facial Cream',
      brand: "Kiehl's",
      category: 'Nemlendirici',
      timeOfDay: 'both',
      imageUrl: '',
      description: 'Günlük kullanım için nem ve bariyer desteği sağlayan krem.',
      activeIngredients: ['Glycerin', 'Squalane'],
      expiryDate: '2027-10'
    },
    {
      id: 'demo-3',
      name: 'Calendula Herbal-Extract Toner',
      brand: "Kiehl's",
      category: 'Tonik',
      timeOfDay: 'both',
      imageUrl: '',
      description: 'Cildi sakinleştirmeye ve rutine hazırlamaya yardımcı tonik.',
      activeIngredients: ['Calendula Extract'],
      expiryDate: '2027-01'
    },
    {
      id: 'demo-4',
      name: 'Ambre Solaire Super UV SPF50+',
      brand: 'Garnier',
      category: 'Güneş Kremi',
      timeOfDay: 'morning',
      imageUrl: '',
      description: 'Günlük kullanıma uygun yüksek korumalı SPF ürünü.',
      activeIngredients: ['SPF 50+', 'Ceramide'],
      expiryDate: '2026-11'
    },
    {
      id: 'demo-5',
      name: 'SkinActive Vitamin C Glow Booster Serum',
      brand: 'Garnier',
      category: 'Serum',
      timeOfDay: 'morning',
      imageUrl: '',
      description: 'Aydınlık görünüm hedefleyen C vitamini odaklı serum.',
      activeIngredients: ['Vitamin C', 'Niacinamide'],
      expiryDate: '2027-06'
    },
    {
      id: 'demo-6',
      name: 'Lipikar Huile Lavante AP+',
      brand: 'La Roche-Posay',
      category: 'Temizleyici',
      timeOfDay: 'both',
      imageUrl: '',
      description: 'Hassas ciltler için nazik temizleme yağı.',
      activeIngredients: ['Glycerin', 'Niacinamide'],
      expiryDate: '2027-08'
    },
    {
      id: 'demo-7',
      name: 'Creamy Eye Treatment',
      brand: "Kiehl's",
      category: 'Göz Kremi',
      timeOfDay: 'both',
      imageUrl: '',
      description: 'Göz çevresini destekleyen krem bakım ürünü.',
      activeIngredients: ['Avocado Oil'],
      expiryDate: '2027-04'
    },
    {
      id: 'demo-8',
      name: 'Nem Bombası Canlandırıcı Kağıt Maske',
      brand: 'Garnier',
      category: 'Maske',
      timeOfDay: 'evening',
      imageUrl: '',
      description: 'Haftalık nem desteği için kağıt maske.',
      activeIngredients: ['Hyaluronic Acid'],
      expiryDate: '2027-12'
    },
    {
      id: 'demo-9',
      name: 'Cicaplast Baume B5+',
      brand: 'La Roche-Posay',
      category: 'Nemlendirici',
      timeOfDay: 'both',
      imageUrl: '',
      description: 'Bariyer desteği ve hassasiyet dönemleri için onarıcı bakım.',
      activeIngredients: ['Panthenol', 'Madecassoside'],
      expiryDate: '2027-09'
    }
  ]);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      // Sprint 1 uses prototype state, so we won't overwrite the initial demo products for now.
      // setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.addProduct(productData);
      setProducts(prev => [...prev, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await productService.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loadProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};

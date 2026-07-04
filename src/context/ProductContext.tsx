
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
      name: 'C-Firma Fresh Day Serum',
      brand: 'Drunk Elephant',
      category: 'Serum',
      timeOfDay: 'morning',
      imageUrl: 'https://images.unsplash.com/photo-1629198725697-3ad774eb076f?auto=format&fit=crop&q=80&w=400',
      description: 'C vitamini içeren aydınlatıcı serum.',
      activeIngredients: ['Vitamin C'],
      expiryDate: '2026-08'
    },
    {
      id: 'demo-2',
      name: 'Water Bank Blue Cream',
      brand: 'LANEIGE',
      category: 'Nemlendirici',
      timeOfDay: 'both',
      imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400',
      description: 'Derinlemesine nemlendirici krem.',
      activeIngredients: ['Hyaluronic Acid'],
      expiryDate: '2027-10'
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

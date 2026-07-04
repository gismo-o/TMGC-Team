
export type Category = 'Temizleyici' | 'Tonik' | 'Serum' | 'Göz Kremi' | 'Nemlendirici' | 'Güneş Kremi' | 'Maske' | 'Diğer';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  timeOfDay: 'morning' | 'evening' | 'both';
  imageUrl: string;
  cutoutImageUrl?: string;
  description: string;
  expiryDate?: string;
  activeIngredients?: string[];
  isFavorite?: boolean;
}

export type ProductDraft = Omit<Product, 'id'>;

export type RootStackParamList = {
  Login: undefined;
  SignIn: undefined;
  SignUp: undefined;
  SkinType: undefined;
  SkinConditions: undefined;
  MainTabs: undefined; 
  Scanner: undefined;
  ProductReview: { scannedProduct?: ProductDraft; editingProductId?: string } | undefined;
  ProductDetail: { productId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Routine: undefined;
  Profile: undefined;
};

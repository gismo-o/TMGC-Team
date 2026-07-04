import { ImageSourcePropType } from 'react-native';
import { Category, ProductDraft } from '../types';

type ProductVisualInput = Pick<ProductDraft, 'brand' | 'name' | 'category' | 'cutoutImageUrl'>;

const fallbackProductAssets: Record<Category, ImageSourcePropType> = {
  Temizleyici: require('../../assets/products/cleanser-pump.png'),
  Tonik: require('../../assets/products/toner-bottle.png'),
  Serum: require('../../assets/products/serum-bottle.png'),
  'Göz Kremi': require('../../assets/products/eye-cream-tube.png'),
  Nemlendirici: require('../../assets/products/moisturizer-jar.png'),
  'Güneş Kremi': require('../../assets/products/sunscreen-tube.png'),
  Maske: require('../../assets/products/mask-jar.png'),
  Diğer: require('../../assets/products/generic-bottle.png'),
};

const localCutoutAssets: Record<string, ImageSourcePropType> = {
  'local:la-roche-effaclar-kplus': require('../../assets/product-cutouts/la-roche-effaclar-kplus.png'),
};

const normalize = (value = '') => value.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();

export const matchProductCutout = (brand?: string, name?: string) => {
  const text = normalize(`${brand || ''} ${name || ''}`);

  if (text.includes('la roche') && text.includes('effaclar')) {
    return 'local:la-roche-effaclar-kplus';
  }

  return undefined;
};

export const getProductVisualSource = (product: ProductVisualInput, imageFailed = false): ImageSourcePropType => {
  const matchedCutout = product.cutoutImageUrl || matchProductCutout(product.brand, product.name);

  if (!imageFailed && matchedCutout) {
    return localCutoutAssets[matchedCutout] || { uri: matchedCutout };
  }

  return fallbackProductAssets[product.category];
};

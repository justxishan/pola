export enum ProductCategory {
  VEGETABLE = 'vegetable',
  FRUIT = 'fruit',
  GRAIN_PULSE = 'grain_pulse',
  SPICE_HERB = 'spice_herb',
  DAIRY_EGG = 'dairy_egg',
  TUBER_ROOT = 'tuber_root',
  COCONUT_PLANTATION = 'coconut_plantation',
  OTHER = 'other',
}

export interface CategoryMetadata {
  id: ProductCategory;
  nameEn: string;
  nameSi: string;
  nameTa: string;
  description: string;
  requiresColdChain: boolean;
}

export const PRODUCT_CATEGORIES: Record<ProductCategory, CategoryMetadata> = {
  [ProductCategory.VEGETABLE]: {
    id: ProductCategory.VEGETABLE,
    nameEn: 'Vegetables',
    nameSi: 'එළවළු',
    nameTa: 'காய்கறிகள்',
    description: 'Fresh farm-harvested vegetables across Sri Lanka',
    requiresColdChain: false,
  },
  [ProductCategory.FRUIT]: {
    id: ProductCategory.FRUIT,
    nameEn: 'Fruits',
    nameSi: 'පළතුරු',
    nameTa: 'பழங்கள்',
    description: 'Tropical and highland seasonal fresh fruits',
    requiresColdChain: false,
  },
  [ProductCategory.GRAIN_PULSE]: {
    id: ProductCategory.GRAIN_PULSE,
    nameEn: 'Grains & Pulses',
    nameSi: 'ධාන්‍ය සහ පරිප්පු',
    nameTa: 'தானியங்கள் மற்றும் பருப்பு',
    description: 'Paddy, traditional rice varieties, kurakkan, mung beans',
    requiresColdChain: false,
  },
  [ProductCategory.SPICE_HERB]: {
    id: ProductCategory.SPICE_HERB,
    nameEn: 'Spices & Herbs',
    nameSi: 'කුළුබඩු සහ ඖෂධ පැළෑටි',
    nameTa: 'மசாலா மற்றும் மூலிகைகள்',
    description: 'Ceylon cinnamon, black pepper, cardamom, clove, ginger, turmeric',
    requiresColdChain: false,
  },
  [ProductCategory.DAIRY_EGG]: {
    id: ProductCategory.DAIRY_EGG,
    nameEn: 'Dairy & Eggs',
    nameSi: 'කිරි නිෂ්පාදන සහ බිත්තර',
    nameTa: 'பால் பொருட்கள் மற்றும் முட்டைகள்',
    description: 'Fresh cow milk, buffalo curd, farm eggs',
    requiresColdChain: true,
  },
  [ProductCategory.TUBER_ROOT]: {
    id: ProductCategory.TUBER_ROOT,
    nameEn: 'Tubers & Roots',
    nameSi: 'අල වර්ග',
    nameTa: 'கிழங்கு வகைகள்',
    description: 'Manioc, sweet potato, innala, kiri ala',
    requiresColdChain: false,
  },
  [ProductCategory.COCONUT_PLANTATION]: {
    id: ProductCategory.COCONUT_PLANTATION,
    nameEn: 'Coconut & Plantation',
    nameSi: 'පොල් සහ වතු බෝග',
    nameTa: 'தேங்காய் மற்றும் பெருந்தோட்ட பயிர்கள்',
    description: 'Fresh coconuts, king coconuts, areca nut, kithul treacle/jaggery',
    requiresColdChain: false,
  },
  [ProductCategory.OTHER]: {
    id: ProductCategory.OTHER,
    nameEn: 'Other Agro Products',
    nameSi: 'වෙනත් කෘෂි නිෂ්පාදන',
    nameTa: 'மற்ற விவசாய பொருட்கள்',
    description: 'Value added agricultural produce, seeds, organic compost',
    requiresColdChain: false,
  },
};

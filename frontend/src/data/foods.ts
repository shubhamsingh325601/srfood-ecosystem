export interface Food {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  veg: boolean;
  category: string;
  bestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  ingredients?: string[];
  longDesc?: string;
}

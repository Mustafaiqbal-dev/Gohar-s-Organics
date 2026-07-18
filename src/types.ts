export interface Product {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  category: 'serum' | 'soap' | 'hair' | 'gifts';
  price: number; // in PKR
  originalPrice?: number; // for showing discount
  image: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  skinType?: string;
  concern?: string;
  details: string[];
  usage: string;
  ingredients: string;
  stock: number;
  badge?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  productName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  items: CartItem[];
  total: number;
  date: string;
  paymentMethod: 'cod'; // Cash on Delivery is extremely standard in Pakistan
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}


export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  brand?: string;
  description: string;
  detailedDescription?: string;
  images: string[];
  stock: number;
  colors?: string[];
  sizes?: string[];
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum ViewState {
  HOME = 'HOME',
  PRODUCT_DETAILS = 'PRODUCT_DETAILS',
  CART = 'CART',
  ADMIN = 'ADMIN',
  FAVORITES = 'FAVORITES',
  PROFILE = 'PROFILE',
  TRACK_ORDER = 'TRACK_ORDER',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  FAQ = 'FAQ'
}

export type Currency = 'SAR' | 'USD' | 'YER';

export interface ExchangeRates {
  USD: number; // Divider (SAR / rate)
  YER: number; // Multiplier (SAR * rate)
}

export interface Address {
  id: string;
  type: string; // e.g., "Home", "Work"
  recipientName: string;
  phone: string;
  city: string;
  street: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  joinDate?: string;
  walletBalance?: number;
  loyaltyPoints?: number;
  addresses?: Address[];
  permissions?: string[]; // Added permissions array
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  description: string;
  estimatedDays: string;
}

export interface UserOrder {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  currency: Currency;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod: string;
}

export interface Coupon {
    id: string;
    code: string;
    discount: number;
    expiryDate: string;
    isActive: boolean;
    usageCount: number;
}

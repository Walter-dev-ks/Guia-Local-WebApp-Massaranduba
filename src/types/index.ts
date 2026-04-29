export interface Business {
  id: string;
  name: string;
  tradeName: string;
  cnpj: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  instagram?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  photos: string[];
  coverPhoto: string;
  hours: WeeklyHours;
  rating: number;
  reviewCount: number;
  verified: boolean;
  createdAt: string;
  lastVerified: string;
}

export interface WeeklyHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface FeedPost {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  image: string;
  type: 'promotion' | 'announcement' | 'sponsored' | 'local_sale';
  createdAt: string;
}

export interface Review {
  id: string;
  businessId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Question {
  id: string;
  businessId: string;
  userName: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  createdAt: string;
  answeredAt?: string;
}

export type UserRole = 'guest' | 'client' | 'admin';

export type GenderTag = 'Female' | 'Male' | 'Gender-Inclusive';

export type ServiceCategory = string;

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  createdAt?: any;
}

export interface UploadedImage {
  id: string;
  src: string;
  file?: File;
  category: ServiceCategory;
  gender?: GenderTag;
  title?: string;
  isHidden?: boolean;
  createdAt?: any;
}

export interface BookingData {
  id: string;
  name: string;
  email: string;
  service: ServiceCategory;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  notes?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
  image: string;
  status: 'pending' | 'approved';
}

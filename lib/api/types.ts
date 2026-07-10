export type UserRole = 'admin' | 'staff' | 'super_staff' | 'user';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FieldStatus = 'active' | 'inactive' | 'maintenance';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'cash' | 'bank_transfer' | 'vnpay';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Sport {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  description: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Field {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: FieldStatus;
  images: string[];
  sportId: string;
  venueId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldWithRelations extends Field {
  sport: Sport;
  venue: Venue;
}

export interface VenueWithFields extends Venue {
  fields: Array<Field & { sport: Sport }>;
}

export interface Review {
  id: string;
  userId: string;
  fieldId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface ReviewWithRelations extends Review {
  user: ReviewUser;
  field?: FieldWithRelations;
}

export interface GetVenuesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface Booking {
  id: string;
  userId: string;
  fieldId: string;
  timeslotId: string;
  date: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export type RefreshResponse = AuthTokens;

export interface UploadResponse {
  key: string;
  url: string;
}

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'owner' | 'user';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IEntityImage {
  id: string;
  url: string;
  isThumbnail: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface IVenueImage extends IEntityImage {
  venueId: string;
}

export interface ICourtImage extends IEntityImage {
  courtId: string;
}

export interface ISport {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAmenity {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentMethod {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IOperatingHour {
  id?: string;
  venueId?: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface IVenue {
  id: string;
  name: string;
  location: string;
  address?: string;
  district?: string;
  city?: string;
  longitude: number;
  latitude: number;
  openTime?: string;
  closeTime?: string;
  operatingHours?: IOperatingHour[];
  restStartTime?: string;
  restEndTime?: string;
  description?: string;
  ratingAverage?: number;
  ratingCount?: number;
  bookingCount?: number;
  favoriteCount?: number;
  viewCount?: number;
  venueImages?: IVenueImage[];
  /** FE convenience — mapped từ venueImages */
  images?: string[];
  courts?: ICourt[];
  amenities?: IAmenity[];
  createdAt: string;
  updatedAt: string;
}

export interface ICourt {
  id: string;
  name: string;
  description?: string;
  basePriceVnd: number;
  minDurationMinutes: number;
  durationStepMinutes: number;
  status: 'active' | 'inactive';
  sportId: string;
  venueId: string;
  courtImages?: ICourtImage[];
  images?: string[];
  sport?: ISport;
  venue?: IVenue;
  createdAt: string;
  updatedAt: string;
}

export type ICourtWithSport = ICourt & { sport: ISport };

export interface IAvailabilitySlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  subtotal: number;
  status: 'available' | 'booked' | 'past';
}

export interface ICourtAvailability {
  courtId: string;
  date: string;
  slots: IAvailabilitySlot[];
}

export interface IBookingItem {
  id: string;
  bookingId: string;
  courtId: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  pricePerHour: number;
  subtotal: number;
  status: 'active' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  court?: ICourt;
  venue?: IVenue;
}

export interface IBooking {
  id: string;
  userId: string;
  bookingCode: string;
  status: 'waiting_payment' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  note?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<IUser, 'id' | 'name' | 'email' | 'phone'>;
  items?: IBookingItem[];
  payments?: IPayment[];
}

export interface IPayment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  transactionCode?: string;
  paidAt?: string;
  venuePaymentAccountId?: string;
  gatewayResponse?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  booking?: IBooking;
}

export interface IReview {
  id: string;
  userId: string;
  venueId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: Pick<IUser, 'id' | 'name' | 'email' | 'phone' | 'avatarUrl'>;
  venue?: IVenue;
}

export interface INotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface CreateBookingItemPayload {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateBookingPayload {
  items: CreateBookingItemPayload[];
  note?: string;
}

export interface CreatePaymentPayload {
  bookingId: string;
  method?: 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  venuePaymentAccountId?: string;
}

export interface CreateReviewPayload {
  venueId: string;
  rating: number;
  comment?: string;
}

export type ReviewEligibilityReason = 'no_confirmed_booking' | 'already_reviewed';

export interface ReviewEligibility {
  canReview: boolean;
  reason: ReviewEligibilityReason;
  message: string;
}
export interface IUserPaymentMethod {
  id: string;
  userId: string;
  type: 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  provider: string;
  providerToken?: string;
  maskedNumber?: string;
  holderName?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPaymentMethodPayload {
  type: 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  provider: string;
  providerToken?: string;
  maskedNumber?: string;
  holderName?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateUserPaymentMethodPayload {
  type?: 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  provider?: string;
  providerToken?: string;
  maskedNumber?: string;
  holderName?: string;
  isDefault?: boolean;
  isActive?: boolean;
}
export interface CourtListParams {
  venueId?: string;
  sportId?: string;
  status?: 'active' | 'inactive';
  minPrice?: number | string;
  maxPrice?: number | string;
  search?: string;
}

export interface ListParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
}

export interface VenueListParams extends ListParams {
  city?: string;
  district?: string;
}

export type GetVenuesParams = VenueListParams;
export type VenueWithFields = IVenue;
export type ReviewWithRelations = IReview;
export type AccountMe = IUser;
export type User = IUser;
export type Sport = ISport;
export type Field = ICourt;

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  data: T;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export type UploadFolder = 'avatars' | 'venues' | 'courts' | 'payments';

export interface UploadResponse {
  url: string;
  key?: string;
}

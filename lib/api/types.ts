export type UserRole = 'admin' | 'staff' | 'user';
export type FieldStatus = 'active' | 'inactive';
export type BookingStatus =
  | 'waiting_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'expired';
export type BookingItemStatus = 'active' | 'cancelled';
export type SlotAvailabilityStatus = 'available' | 'booked';
export type PaymentTxnMethod = 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
export type UploadFolder = 'avatars' | 'venues' | 'fields' | 'payments';

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
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

export interface IFieldImage extends IEntityImage {
  fieldId: string;
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

export interface IVenue {
  id: string;
  name: string;
  location: string;
  longitude: number;
  latitude: number;
  openTime: string;
  closeTime: string;
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
  fields?: IField[];
  amenities?: IAmenity[];
  createdAt: string;
  updatedAt: string;
}

export interface IField {
  id: string;
  name: string;
  description?: string;
  price: number;
  minDurationMinutes: number;
  durationStepMinutes: number;
  status: FieldStatus;
  sportId: string;
  venueId: string;
  fieldImages?: IFieldImage[];
  /** FE convenience — mapped từ fieldImages */
  images?: string[];
  sport?: ISport;
  venue?: IVenue;
  createdAt: string;
  updatedAt: string;
}

export interface IAvailabilitySlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  subtotal: number;
  status: SlotAvailabilityStatus;
}

export interface IFieldAvailability {
  fieldId: string;
  date: string;
  slots: IAvailabilitySlot[];
}

export interface IBookingItem {
  id: string;
  bookingId: string;
  fieldId: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  pricePerHour: number;
  subtotal: number;
  status: BookingItemStatus;
  createdAt: string;
  updatedAt: string;
  field?: IField;
  venue?: IVenue;
}

export interface IBooking {
  id: string;
  userId: string;
  bookingCode: string;
  status: BookingStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  note?: string | null;
  expiresAt?: string | null;
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
  method: PaymentTxnMethod;
  status: PaymentStatus;
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
  readAt?: string | null;
  createdAt: string;
}

export interface CreateBookingItemPayload {
  fieldId: string;
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
  method?: PaymentTxnMethod;
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
  reason: ReviewEligibilityReason | null;
  message: string | null;
}

export type UserPaymentMethodType = 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';

export interface IUserPaymentMethod {
  id: string;
  userId: string;
  type: UserPaymentMethodType;
  provider: string;
  providerToken?: string | null;
  maskedNumber?: string | null;
  holderName?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPaymentMethodPayload {
  type: UserPaymentMethodType;
  provider: string;
  providerToken?: string;
  maskedNumber?: string;
  holderName?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateUserPaymentMethodPayload {
  type?: UserPaymentMethodType;
  provider?: string;
  providerToken?: string | null;
  maskedNumber?: string | null;
  holderName?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ListParams {
  search?: string;
  page?: number | string;
  limit?: number | string;
}

export type VenueListParams = ListParams;

export interface FieldListParams extends ListParams {
  venueId?: string;
  sportId?: string;
  status?: FieldStatus;
  minPrice?: number | string;
  maxPrice?: number | string;
}

/** @deprecated Use PaymentTxnMethod */
export type PaymentMethod = PaymentTxnMethod;

/** Auth / API envelope (kept for client + auth-store) */
export type User = IUser;

export interface ApiResponse<T> {
  statusCode?: number;
  status?: string;
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
  user: IUser;
}

export type RefreshResponse = AuthTokens;

export interface UploadResponse {
  key: string;
  url: string;
}

/** UI aliases */
export type Sport = ISport;
export type Venue = IVenue;
export type Field = IField;
export type Review = IReview;
export type Booking = IBooking;
export type Payment = IPayment;
export type Notification = INotification;

export type FieldWithRelations = IField;
export type VenueWithFields = IVenue;
export type ReviewWithRelations = IReview;
export type IBookingWithRelations = IBooking;

export type GetVenuesParams = VenueListParams;

export interface AccountMe extends IUser {
  permissions?: string[];
}

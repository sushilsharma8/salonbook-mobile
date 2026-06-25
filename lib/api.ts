import { getDefaultApiUrl } from './theme';

export type UserGender = 'MALE' | 'FEMALE' | 'OTHER';
export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type ServiceTargetGender = 'MALE' | 'FEMALE' | 'UNISEX';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  gender?: UserGender | null;
}

export interface SalonListItem {
  id: string;
  name: string;
  address: string;
  images: string | null;
  categories: string | null;
  openTime: string;
  closeTime: string;
  hours?: SalonDayHours[];
  serviceCount: number;
  reviewCount: number;
  avgRating: number | null;
}

export interface SalonDayHours {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export interface ServiceVariant {
  id: string;
  targetGender: ServiceTargetGender;
  price: number;
  duration: number;
}

export interface Service {
  id: string;
  name: string;
  variants: ServiceVariant[];
}

export interface Review {
  id: string;
  salonId?: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { name?: string };
}

export interface SalonDetail extends SalonListItem {
  services: Service[];
  reviews: Review[];
  staff?: { id: string; name: string; gender?: string }[];
  owner?: { name?: string; phone?: string };
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface SlotsResponse {
  slots: TimeSlot[];
  reason?: string;
  message?: string;
}

export interface BookingService {
  id: string;
  serviceNameAtBooking?: string;
  service?: { name: string };
}

export interface Booking {
  id: string;
  salonId: string;
  startTime: string;
  status: BookingStatus;
  totalAmount: number;
  salon: {
    id: string;
    name: string;
    address: string;
    owner?: { name?: string; phone?: string };
  };
  services: BookingService[];
}

export interface MyBookingsResponse {
  bookings: Booking[];
  reviews: Review[];
}

export interface StaffMember {
  id: string;
  name: string;
  skills?: string | null;
  gender?: string | null;
}

export interface SellerSalon {
  id: string;
  name: string;
  address: string;
  images: string | null;
  categories: string | null;
  openTime: string;
  closeTime: string;
  hours?: SalonDayHours[];
  services: Service[];
  staff?: StaffMember[];
}

export interface SellerBooking extends Booking {
  user?: { name: string; phone?: string | null };
  staff?: { name: string };
}

export interface AdminStats {
  users: number;
  salons: number;
  bookings: number;
  revenue: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  noShowCount: number;
  createdAt: string;
}

export interface AdminSalonListItem {
  id: string;
  name: string;
  address: string;
  openTime: string;
  closeTime: string;
  owner?: { name: string; email: string };
}

export interface AdminSalonDetail extends AdminSalonListItem {
  images: string | null;
  categories: string | null;
  services: Service[];
  staff: StaffMember[];
  bookings: SellerBooking[];
  owner?: { name: string; email: string; phone?: string | null };
}

export interface ActionBooking {
  id: string;
  startTime: string;
  status: BookingStatus;
  totalAmount: number;
  user?: { name: string; phone?: string | null };
  staff?: { name: string };
  salon?: { name: string; ownerId?: string };
  services: BookingService[];
}

export interface ServiceVariantInput {
  targetGender: ServiceTargetGender;
  price: number;
  duration: number;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export function resolveImageUrl(baseUrl: string, url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = baseUrl.replace(/\/$/, '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}

export function parseSalonImages(images: string | null | undefined, baseUrl: string): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
        .map((img) => resolveImageUrl(baseUrl, img));
    }
  } catch {
    const parts = images.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts.map((img) => resolveImageUrl(baseUrl, img));
  }
  return [];
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...init } = options;
  const baseUrl = getDefaultApiUrl();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  }

  return data as T;
}

async function uploadRequest<T>(
  path: string,
  token: string,
  formData: FormData,
): Promise<T> {
  const baseUrl = getDefaultApiUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'CUSTOMER' | 'SELLER';
    gender?: UserGender;
  }) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSalons: () => request<SalonListItem[]>('/api/salons'),

  getSalon: (id: string) => request<SalonDetail>(`/api/salons/${id}`),

  getSlots: (token: string, salonId: string, serviceIds: string[], date: string) =>
    request<SlotsResponse>(
      `/api/slots?salonId=${salonId}&serviceIds=${serviceIds.join(',')}&date=${date}`,
      { token },
    ),

  createBooking: (
    token: string,
    payload: { salonId: string; serviceIds: string[]; time: string; totalAmount: number },
  ) =>
    request<Booking & { actionToken?: string }>('/api/bookings', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  getMyBookings: (token: string) =>
    request<Booking[] | MyBookingsResponse>('/api/bookings/my', { token }),

  updateBookingStatus: (token: string, id: string, status: BookingStatus) =>
    request<Booking>(`/api/bookings/${id}/status`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ status }),
    }),

  createReview: (token: string, payload: { salonId: string; rating: number; comment: string }) =>
    request<Review>('/api/reviews', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  updateProfile: (
    token: string,
    payload: { name: string; phone: string; gender: UserGender },
  ) => request<User>('/api/users/profile', { method: 'PUT', token, body: JSON.stringify(payload) }),

  // Seller
  getSellerSalon: (token: string) =>
    request<SellerSalon | null>('/api/seller/salon', { token }),

  saveSellerSalon: (
    token: string,
    payload: {
      name: string;
      address: string;
      openTime: string;
      closeTime: string;
      images: string;
      categories: string;
      weeklyHours: SalonDayHours[];
    },
  ) =>
    request<SellerSalon>('/api/seller/salon', {
      method: 'POST',
      token,
      body: JSON.stringify({ ...payload, weeklyHours: payload.weeklyHours }),
    }),

  uploadSellerImages: (
    token: string,
    files: { uri: string; name: string; type: string }[],
  ) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
    }
    return uploadRequest<{ urls: string[] }>('/api/seller/upload-images', token, formData);
  },

  addSellerService: (
    token: string,
    payload: { name: string; variants: ServiceVariantInput[] },
  ) =>
    request<Service>('/api/seller/services', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  updateSellerService: (
    token: string,
    id: string,
    payload: { name: string; variants: ServiceVariantInput[] },
  ) =>
    request<Service>(`/api/seller/services/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    }),

  deleteSellerService: (token: string, id: string) =>
    request<{ success: boolean }>(`/api/seller/services/${id}`, { method: 'DELETE', token }),

  addSellerStaff: (
    token: string,
    payload: { name: string; skills?: string; gender?: string },
  ) =>
    request<StaffMember>('/api/seller/staff', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  deleteSellerStaff: (token: string, id: string) =>
    request<{ success: boolean }>(`/api/seller/staff/${id}`, { method: 'DELETE', token }),

  getSellerBookings: (token: string) =>
    request<SellerBooking[]>('/api/seller/bookings', { token }),

  // Admin
  getAdminStats: (token: string) => request<AdminStats>('/api/admin/stats', { token }),

  getAdminActivity: (token: string) => request<SellerBooking[]>('/api/admin/activity', { token }),

  getAdminUsers: (token: string) => request<AdminUser[]>('/api/admin/users', { token }),

  deleteAdminUser: (token: string, id: string) =>
    request<{ success: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE', token }),

  reactivateAdminUser: (token: string, id: string) =>
    request<{ success: boolean }>(`/api/admin/users/${id}/reactivate`, {
      method: 'POST',
      token,
    }),

  resetAdminUserPassword: (token: string, id: string, password: string) =>
    request<{ success: boolean }>(`/api/admin/users/${id}/password`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ password }),
    }),

  getAdminSalons: (token: string) => request<AdminSalonListItem[]>('/api/admin/salons', { token }),

  getAdminSalon: (token: string, id: string) =>
    request<AdminSalonDetail>(`/api/admin/salons/${id}`, { token }),

  updateAdminSalon: (
    token: string,
    id: string,
    payload: {
      name: string;
      address: string;
      openTime: string;
      closeTime: string;
      images: string;
      categories: string;
    },
  ) =>
    request<AdminSalonDetail>(`/api/admin/salons/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(payload),
    }),

  addAdminSalonService: (
    token: string,
    salonId: string,
    payload: { name: string; variants: ServiceVariantInput[] },
  ) =>
    request<Service>(`/api/admin/salons/${salonId}/services`, {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  deleteAdminSalonService: (token: string, salonId: string, serviceId: string) =>
    request<{ success: boolean }>(`/api/admin/salons/${salonId}/services/${serviceId}`, {
      method: 'DELETE',
      token,
    }),

  addAdminSalonStaff: (
    token: string,
    salonId: string,
    payload: { name: string; skills?: string; gender?: string },
  ) =>
    request<StaffMember>(`/api/admin/salons/${salonId}/staff`, {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    }),

  deleteAdminSalonStaff: (token: string, salonId: string, staffId: string) =>
    request<{ success: boolean }>(`/api/admin/salons/${salonId}/staff/${staffId}`, {
      method: 'DELETE',
      token,
    }),

  // Booking action token (seller/admin)
  getBookingByActionToken: (token: string, actionToken: string) =>
    request<ActionBooking>(`/api/bookings/action/${actionToken}`, { token }),

  postBookingAction: (
    token: string,
    actionToken: string,
    action: 'CONFIRMED' | 'CANCELLED',
  ) =>
    request<Booking>(`/api/bookings/action/${actionToken}`, {
      method: 'POST',
      token,
      body: JSON.stringify({ action }),
    }),
};

export function normalizeMyBookings(data: Booking[] | MyBookingsResponse): {
  bookings: Booking[];
  reviews: Review[];
} {
  if (Array.isArray(data)) {
    return { bookings: data, reviews: [] };
  }
  return { bookings: data.bookings || [], reviews: data.reviews || [] };
}

export function getEffectiveVariant(
  service: Service,
  gender?: UserGender | null,
): ServiceVariant | null {
  const variants = service.variants || [];
  if (!gender) return null;
  const genderTarget = gender === 'FEMALE' ? 'FEMALE' : gender === 'MALE' ? 'MALE' : null;
  const exact = genderTarget ? variants.find((v) => v.targetGender === genderTarget) : null;
  const unisex = variants.find((v) => v.targetGender === 'UNISEX');
  if (gender === 'OTHER') return unisex || null;
  return exact || unisex || null;
}

export function getDisplayVariant(service: Service, gender?: UserGender | null): ServiceVariant | null {
  if (gender) return getEffectiveVariant(service, gender);
  const variants = service.variants || [];
  if (!variants.length) return null;
  const unisex = variants.find((v) => v.targetGender === 'UNISEX');
  if (unisex) return unisex;
  return variants.reduce<ServiceVariant | null>(
    (min, v) => (!min || v.price < min.price ? v : min),
    null,
  );
}

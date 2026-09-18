const BASE = process.env.NEXT_PUBLIC_URL_PROD || 'http://localhost:3003';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `API error ${res.status}`);
  }
  return res.json();
}

export interface BusinessListing {
  id: string;
  slug: string;
  name: string;
  category?: string | null;
  city: string;
  zone?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  source: 'GOOGLE' | 'MANUAL' | 'ADMIN' | 'IMPORT' | 'OPENSTREETMAP';
  status: 'DRAFT' | 'PENDING' | 'VISIBLE' | 'VERIFIED' | 'REJECTED';
  isClaimed: boolean;
  isVisible: boolean;
}

// ── Orders ─────────────────────────────────────────────────────────
export interface OrderItemPayload { productId?: string | number; partnerProductId?: string; quantity: number; unitPrice: number; }
export interface CreateOrderPayload { city: string; quarter: string; deliveryFee: number; totalPrice: number; customerName?: string; customerPhone?: string; note?: string; partnerId?: string; items: OrderItemPayload[]; }
export const createOrder = (data: CreateOrderPayload) => request('/orders', { method: 'POST', body: JSON.stringify(data) });

// ── Service Requests ───────────────────────────────────────────────
export interface CreateServiceRequestPayload { service: string; city: string; quarter: string; description?: string; customerName?: string; customerPhone?: string; }
export const createServiceRequest = (data: CreateServiceRequestPayload) => request('/service-requests', { method: 'POST', body: JSON.stringify(data) });

// ── Opportunities ──────────────────────────────────────────────────
export interface SubmitOpportunityPayload { title: string; category: string; location: string; description: string; price?: string; contact: string; imageUrl?: string; imageUrls?: string[]; }
export const submitOpportunity = (data: SubmitOpportunityPayload) => request('/opportunities/submit', { method: 'POST', body: JSON.stringify(data) });
export interface CreateInterestPayload { name: string; phone: string; message?: string; }
export const createInterest = (opportunityId: string, data: CreateInterestPayload) => request(`/opportunities/${opportunityId}/interest`, { method: 'POST', body: JSON.stringify(data) });
export const getOpportunities = () => request<any[]>('/opportunities');
export const getOpportunityBySlug = (slug: string) => request<any>(`/opportunities/slug/${slug}`);

// ── Partners ───────────────────────────────────────────────────────
export const createPartner = (data: any) => request('/partners', { method: 'POST', body: JSON.stringify(data) });

// ── Business listings ──────────────────────────────────────────────
export const getBusinessListingsMap = () => request<BusinessListing[]>('/businesses/map');
export const getBusinessListing = (slug: string) => request<BusinessListing>(`/businesses/slug/${encodeURIComponent(slug)}`);
export const searchBusinessListings = (params: { q?: string; city?: string; category?: string } = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value); });
  return request<BusinessListing[]>(`/businesses/search${query.toString() ? `?${query}` : ''}`);
};
export const claimBusinessListing = (id: string) => request<BusinessListing>(`/businesses/${id}/claim`, { method: 'PATCH' });

// ── Notifications ──────────────────────────────────────────────────
export const getNotifications = () => request<any[]>('/notifications');
export const getUnreadCount = () => request<number>('/notifications/unread-count');
export const markAllRead = () => request('/notifications/mark-all-read', { method: 'PATCH' });

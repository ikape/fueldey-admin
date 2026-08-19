export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'commuter' | 'vendor' | 'admin';
  kycStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  city?: string;
  state?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  createdAt: string;
}

export interface FuelInventoryItem {
  id: string;
  fuelType: string;
  pricePerLiter: string;
  isAvailable: boolean;
}

export interface AdminStation {
  id: string;
  vendorId: string;
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  isOpen: boolean;
  createdAt: string;
  inventory?: FuelInventoryItem[];
}

export interface AdminDocument {
  id: string;
  userId: string;
  collectionId: string;
  name: string;
  type: string;
  fileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
}

export interface AdminTransaction {
  id: string;
  userId: string;
  type: 'top_up' | 'purchase' | 'refund' | 'withdrawal';
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  description?: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  commuterId: string;
  stationId: string;
  amount: string;
  liters: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface AdminVehicle {
  id: string;
  userId: string;
  name?: string;
  make?: string;
  model?: string;
  licensePlate: string;
  fleetGroupId?: string;
  createdAt: string;
}

export interface AdminFleetGroup {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface AdminReview {
  id: string;
  stationId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface LegalDocument {
  id: string;
  type: 'terms_of_service' | 'privacy_policy';
  target: 'users' | 'vendors' | 'both';
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
}

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
  deletedAt?: string;
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

/** KYCAID's Document object (front/back/selfie etc. submitted during KYC) —
 * fields per https://docs.kycaid.com/objects/documents/document-get. The
 * image fields are direct URLs on KYCAID's side; the admin UI never uses them
 * directly, always through our own /api/kyc/documents/:id/image proxy. */
export interface KycaidDocument {
  document_id: string;
  applicant_id: string;
  type: string;
  status?: 'new' | 'valid' | 'invalid' | null;
  comment?: string | null;
  document_number?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  issuing_authority?: string | null;
  portrait?: string | null;
  front_side?: string | null;
  back_side?: string | null;
  other_side_1?: string | null;
  other_side_2?: string | null;
  other_side_3?: string | null;
  created_at?: string;
  decline_reasons?: string[] | null;
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
  status: 'pending' | 'processing' | 'completed' | 'failed';
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

export interface FleetSummaryUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface AdminVehicle {
  id: string;
  userId: string;
  name?: string;
  make?: string;
  model?: string;
  licensePlate: string;
  fuelType?: string;
  tankCapacity?: string;
  spendingLimit?: string;
  year?: number;
  color?: string;
  driverName?: string;
  fleetGroupId?: string;
  createdAt: string;
  user?: FleetSummaryUser;
  fleetGroup?: { id: string; name: string };
}

export interface AdminFleetGroup {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: string;
  owner?: FleetSummaryUser;
  vehicleCount?: number;
  memberCount?: number;
}

export interface AdminFleetMember {
  id: string;
  role: string;
  createdAt: string;
  user?: FleetSummaryUser;
}

export interface AdminFleetGroupDetail extends AdminFleetGroup {
  members: AdminFleetMember[];
  vehicles: AdminVehicle[];
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

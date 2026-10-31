export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

/** The CAC record the backend found (via Prembly) when a vendor submitted their registration
 * number. Kept on the user so an admin can review it before approving. */
export interface KycBusiness {
  rcNumber: string;
  /** RC = registered company, BN = business name, IT = incorporated trustees. */
  companyType: string;
  companyName?: string;
  /** CAC's own status, upper-cased (the backend only stores ACTIVE businesses for review). */
  companyStatus?: string;
  registrationDate?: string;
  address?: string;
  directors: string[];
  reference?: string;
  checkedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'commuter' | 'vendor' | 'admin';
  kycStatus: KycStatus;
  /** Prembly's reference for the latest KYC check. */
  kycReference?: string;
  /** Vendors only: set once they have submitted a CAC registration number. */
  kycBusiness?: KycBusiness | null;
  city?: string;
  state?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt?: string;
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

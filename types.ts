export interface Address {
  type: 'manual' | 'gps' | 'search';
  displayAddress: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
  mapUrl?: string;
}

export interface MemberData {
  uid: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  memberId: string;
  points: number;
  address?: Address;
}

export interface InventoryItem {
  id: string; // Document ID from Firestore
  name: string;
  stock: number;
  unit: string; // e.g., 'kg', 'pcs', 'blok'
}

export interface InventoryUsageLog {
  id: string;
  itemId: string;
  itemName: string;
  quantityUsed: number;
  unit: string;
  timestamp: Date;
}

export interface StoreSettings {
  address: Address;
}

export interface Redemption {
  id: string; // Document ID
  memberUid: string;
  memberId: string;
  memberName: string;
  pointsToRedeem: number;
  status: 'pending' | 'approved' | 'rejected';
  requestTimestamp: Date;
  processedTimestamp?: Date;
}

// FIX: Centralize Page type definition to resolve type conflicts across components.
export type Page = 
  | 'home' 
  | 'register' 
  | 'member-login' 
  | 'admin-login' 
  | 'about' 
  | 'member-dashboard' 
  | 'admin-dashboard' 
  | 'all-members' 
  | 'inventory'
  | 'settings'
  | 'redemption-history';
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'hirer' | 'vendor' | 'admin';
  phone: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  image: string;
  description: string;
  suitability: string;
  vendorId: number;
  isFeatured: boolean;
  vendor?: User;
  blockedPeriods?: BlockedPeriod[];
}

export interface BlockedPeriod {
  id: number;
  venueId: number;
  fromDate: string;
  toDate: string;
}

export interface Booking {
  id: number;
  hirerId: number;
  venueId: number;
  eventName: string;
  guestCount: number;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'accepted' | 'rejected';
  vendorComment?: string;
  createdAt: string;
  hirer?: User;
  venue?: Venue;
  complianceScore?: number;
}

export interface HireRecord {
  id: number;
  hirerId: number;
  venueId: number;
  eventName: string;
  dateOfHire: string;
  rating?: number;
  venue?: Venue;
}

export interface PreferredVenue {
  id: number;
  hirerId: number;
  venueId: number;
  rank: number;
  venue?: Venue;
}

export interface ComplianceDocument {
  id: number;
  hirerId: number;
  docType: string;
  fileName: string;
  fileUrl?: string;
  uploadedAt: string;
}
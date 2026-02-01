
export enum UserRole {
  PLAYER = 'PLAYER',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER'
}

export enum ResourceMode {
  EXCLUSIVE = 'EXCLUSIVE',
  SHARED = 'SHARED',
  QUANTITY = 'QUANTITY'
}

export enum BookingStatus {
  DRAFT = 'DRAFT',
  HOLD = 'HOLD',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  credits?: number; // For packages
}

export interface Resource {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  mode: ResourceMode;
  capacity: number;
  hourlyRate: number; // Base rate, overrideable by RateCard
  image: string;
}

export interface RateCard {
  id: string;
  name: string;
  resourceType: string; // e.g., 'Basketball', 'Swimming'
  baseRate: number;
  peakRate: number;
  peakHours: number[]; // e.g. [17, 18, 19, 20]
  weekendRateModifier: number; // 1.2 = +20%
}

export interface Policy {
  id: string;
  cancelWindowHrs: number; // hours before booking to cancel
  refundPercentage: number;
  gpsRadiusMeters: number;
  checkInWindowMins: number;
  noShowPenalty: number;
}

export interface Transaction {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  date: string;
  type: 'PAYMENT' | 'REFUND';
  status: PaymentStatus;
  method: 'QR' | 'CASH' | 'CREDITS';
  reference?: string;
}

export interface Booking {
  id: string;
  tenantId: string;
  resourceId: string;
  userId: string;
  date: string;
  startTime: number;
  duration: number;
  status: BookingStatus;
  totalAmount: number;
  qrCode?: string; // Entry Pass
  paymentQr?: string; // Payment Reference
  checkInTime?: string;
  quantity?: number; // For shared resources
}

export interface Tenant {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor?: string;
  logo: string;
  backgroundImage: string; 
  currency: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  qrApiConfig?: {
    apiKey: string;
    webhookUrl: string;
  }
}


import { Resource, ResourceMode, Tenant, User, UserRole, RateCard, Policy, Transaction, PaymentStatus } from "./types";

export const MOCK_TENANT: Tenant = {
  id: 'tenant_1',
  name: 'NeoSports Arena',
  primaryColor: '#4f46e5',
  secondaryColor: '#ec4899',
  logo: 'https://cdn-icons-png.flaticon.com/512/3309/3309991.png',
  backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', 
  location: {
    lat: 34.0522,
    lng: -118.2437,
    address: '123 Sport Ave, Tech City'
  },
  qrApiConfig: {
    apiKey: 'sk_live_123456',
    webhookUrl: 'https://api.neosports.com/webhooks/qr'
  }
};

export const MOCK_POLICIES: Policy = {
    id: 'pol_1',
    cancelWindowHrs: 24,
    refundPercentage: 80,
    gpsRadiusMeters: 200,
    checkInWindowMins: 15,
    noShowPenalty: 10
};

export const MOCK_RATE_CARDS: RateCard[] = [
    {
        id: 'rc_1',
        name: 'Standard Court Pricing',
        resourceType: 'Basketball',
        baseRate: 50,
        peakRate: 75,
        peakHours: [18, 19, 20, 21],
        weekendRateModifier: 1.1
    },
    {
        id: 'rc_2',
        name: 'Pool Access',
        resourceType: 'Swimming',
        baseRate: 15,
        peakRate: 20,
        peakHours: [7, 8, 17, 18],
        weekendRateModifier: 1.2
    }
];

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'res_1',
    tenantId: 'tenant_1',
    name: 'Center Court',
    type: 'Basketball',
    mode: ResourceMode.EXCLUSIVE,
    capacity: 1,
    hourlyRate: 50,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'res_2',
    tenantId: 'tenant_1',
    name: 'Futsal Pitch A',
    type: 'Futsal',
    mode: ResourceMode.EXCLUSIVE,
    capacity: 1,
    hourlyRate: 80,
    image: 'https://images.unsplash.com/photo-1575361204480-aadea252468e?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'res_3',
    tenantId: 'tenant_1',
    name: 'Olympic Lane 1',
    type: 'Swimming',
    mode: ResourceMode.SHARED,
    capacity: 8,
    hourlyRate: 15,
    image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'res_4',
    tenantId: 'tenant_1',
    name: 'Pro Cricket Net',
    type: 'Cricket',
    mode: ResourceMode.EXCLUSIVE,
    capacity: 1,
    hourlyRate: 30,
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800&auto=format&fit=crop'
  }
];

export const MOCK_USERS: User[] = [
  { id: 'u_1', name: 'Alex Player', email: 'alex@demo.com', role: UserRole.PLAYER, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150', credits: 120 },
  { id: 'u_2', name: 'Sarah Staff', email: 'sarah@demo.com', role: UserRole.STAFF, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150' },
  { id: 'u_3', name: 'Mike Admin', email: 'mike@demo.com', role: UserRole.ADMIN, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150' },
  { id: 'u_4', name: 'Coach Carter', email: 'coach@demo.com', role: UserRole.TRAINER, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150' },
];

export const MOCK_TRAINEES = [
    { id: 't_1', name: 'Jordan Belfort', status: 'Active', progress: 75 },
    { id: 't_2', name: 'Alice Wonder', status: 'Injured', progress: 30 },
    { id: 't_3', name: 'Charlie Puth', status: 'Active', progress: 90 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'tx_1', bookingId: 'bk_1', userId: 'u_1', amount: 50, date: '2024-03-10', type: 'PAYMENT', status: PaymentStatus.COMPLETED, method: 'QR', reference: 'REF123456' },
    { id: 'tx_2', bookingId: 'bk_2', userId: 'u_1', amount: 30, date: '2024-03-11', type: 'PAYMENT', status: PaymentStatus.COMPLETED, method: 'QR', reference: 'REF789012' },
];

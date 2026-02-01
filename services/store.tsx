
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus, Resource, User, UserRole, Tenant, Transaction, Policy, RateCard, PaymentStatus } from '../types';
import { MOCK_RESOURCES, MOCK_TENANT, MOCK_USERS, MOCK_POLICIES, MOCK_RATE_CARDS, MOCK_TRANSACTIONS } from '../constants';

interface AppState {
  currentUser: User | null;
  tenant: Tenant;
  resources: Resource[];
  bookings: Booking[];
  transactions: Transaction[];
  policies: Policy;
  rateCards: RateCard[];
  theme: 'dark' | 'light';
  login: (role: UserRole) => void;
  logout: () => void;
  toggleTheme: () => void;
  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'qrCode' | 'paymentQr'>) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  checkIn: (bookingId: string, lat?: number, lng?: number) => { success: boolean; message: string };
  updateTenantBranding: (branding: Partial<Tenant>) => void;
  addResource: (resource: Resource) => void;
  updatePolicy: (policy: Partial<Policy>) => void;
  addRateCard: (card: RateCard) => void;
  updateIntegration: (config: { apiKey: string, webhookUrl: string }) => void;
  verifyTransaction: (transactionId: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant>(MOCK_TENANT);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [policies, setPolicies] = useState<Policy>(MOCK_POLICIES);
  const [rateCards, setRateCards] = useState<RateCard[]>(MOCK_RATE_CARDS);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Initialize with some dummy bookings for demo
  useEffect(() => {
    const dummyBookings: Booking[] = [
      {
        id: 'bk_1',
        tenantId: MOCK_TENANT.id,
        resourceId: 'res_1',
        userId: 'u_1',
        date: new Date().toISOString().split('T')[0],
        startTime: 10,
        duration: 1,
        status: BookingStatus.CONFIRMED,
        totalAmount: 50,
        qrCode: 'ENTRY-QR-123',
        paymentQr: 'PAY-QR-123'
      },
      {
        id: 'bk_2',
        tenantId: MOCK_TENANT.id,
        resourceId: 'res_3',
        userId: 'u_1',
        date: new Date().toISOString().split('T')[0],
        startTime: 14,
        duration: 2,
        status: BookingStatus.CONFIRMED,
        totalAmount: 30,
        qrCode: 'ENTRY-QR-456',
        paymentQr: 'PAY-QR-456'
      }
    ];
    setBookings(dummyBookings);
  }, []);

  const login = (role: UserRole) => {
    const user = MOCK_USERS.find(u => u.role === role);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const calculatePrice = (resourceId: string, date: string, hour: number, duration: number): number => {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return 0;

      // Find applicable rate card
      const rateCard = rateCards.find(rc => rc.resourceType === resource.type);
      
      let rate = resource.hourlyRate;
      if (rateCard) {
          rate = rateCard.baseRate;
          // Apply Peak Pricing
          if (rateCard.peakHours.includes(hour)) {
              rate = rateCard.peakRate;
          }
      }
      return rate * duration;
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'qrCode' | 'paymentQr'>): Promise<Booking> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Recalculate price using Rate Engine
    const dynamicPrice = calculatePrice(bookingData.resourceId, bookingData.date, bookingData.startTime, bookingData.duration) * (bookingData.quantity || 1);

    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${Date.now()}`,
      status: BookingStatus.CONFIRMED, // In real app: PENDING_PAYMENT
      qrCode: `ENTRY-${Date.now()}`,
      paymentQr: `PAY-${Date.now()}`,
      totalAmount: dynamicPrice
    };

    setBookings(prev => [...prev, newBooking]);
    
    // Create Mock Transaction
    const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        bookingId: newBooking.id,
        userId: newBooking.userId,
        amount: dynamicPrice,
        date: new Date().toISOString().split('T')[0],
        type: 'PAYMENT',
        status: PaymentStatus.COMPLETED,
        method: 'QR',
        reference: `REF${Math.floor(Math.random() * 100000)}`
    };
    setTransactions(prev => [newTx, ...prev]);

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const cancelBooking = (bookingId: string, reason?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Policy Check: Cancel Window
    // (Simplification: assuming always valid for demo)
    
    // Refund Logic
    const refundAmount = booking.totalAmount * (policies.refundPercentage / 100);
    
    if (refundAmount > 0) {
        const refundTx: Transaction = {
            id: `tx_ref_${Date.now()}`,
            bookingId: booking.id,
            userId: booking.userId,
            amount: refundAmount,
            date: new Date().toISOString().split('T')[0],
            type: 'REFUND',
            status: PaymentStatus.COMPLETED,
            method: 'QR', // Original method
            reference: `REFUND-${booking.id}`
        };
        setTransactions(prev => [refundTx, ...prev]);
    }

    updateBookingStatus(bookingId, BookingStatus.CANCELLED);
  };

  const checkIn = (bookingId: string, lat?: number, lng?: number): { success: boolean; message: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    // GPS Validation (Mock)
    if (lat && lng) {
        // Calculate distance (very rough approximation for demo)
        const dist = Math.sqrt(Math.pow(lat - tenant.location.lat, 2) + Math.pow(lng - tenant.location.lng, 2));
        // let's say 0.01 degrees is roughly 1km. policy radius is in meters.
        // For simulation, if lat is provided, we assume it's close enough unless it's 0,0
        if (lat === 0 && lng === 0) {
            return { success: false, message: `GPS Check-in Failed: User too far from venue (${policies.gpsRadiusMeters}m radius)` };
        }
    }
    
    updateBookingStatus(bookingId, BookingStatus.CHECKED_IN);
    return { success: true, message: 'Check-in Successful' };
  };

  const updateTenantBranding = (branding: Partial<Tenant>) => {
    setTenant(prev => ({ ...prev, ...branding }));
  };

  const addResource = (resource: Resource) => {
    setResources(prev => [...prev, resource]);
  };

  const updatePolicy = (policy: Partial<Policy>) => {
      setPolicies(prev => ({ ...prev, ...policy }));
  };

  const addRateCard = (card: RateCard) => {
      setRateCards(prev => [...prev, card]);
  };

  const updateIntegration = (config: { apiKey: string, webhookUrl: string }) => {
      setTenant(prev => ({ ...prev, qrApiConfig: config }));
  };

  const verifyTransaction = (transactionId: string) => {
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: PaymentStatus.COMPLETED } : t));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      tenant,
      resources,
      bookings,
      transactions,
      policies,
      rateCards,
      theme,
      login,
      logout,
      toggleTheme,
      createBooking,
      updateBookingStatus,
      cancelBooking,
      checkIn,
      updateTenantBranding,
      addResource,
      updatePolicy,
      addRateCard,
      updateIntegration,
      verifyTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

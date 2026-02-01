
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingStatus, Resource, User, UserRole, Tenant, Transaction, Policy, RateCard, PaymentStatus } from '../types';
import { MOCK_RESOURCES, MOCK_TENANT, MOCK_USERS, MOCK_POLICIES, MOCK_RATE_CARDS, MOCK_TRANSACTIONS } from '../constants';
import { supabase } from './supabase';

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
  isSupabaseConnected: boolean;
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
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Initialize Data
  useEffect(() => {
    const initData = async () => {
      if (supabase) {
        try {
          console.log("ArenaOS: Connecting to Supabase...");
          
          // 1. Fetch Resources
          const { data: resData, error: resError } = await supabase.from('resources').select('*');
          
          if (!resError) {
             console.log("ArenaOS: Connected!");
             setIsSupabaseConnected(true);

             if (resData && resData.length > 0) {
                 // DB has data, use it
                 const mappedResources = resData.map((r: any) => ({
                     id: r.id,
                     tenantId: r.tenant_id,
                     name: r.name,
                     type: r.type,
                     mode: r.mode,
                     capacity: r.capacity,
                     hourlyRate: r.hourly_rate,
                     image: r.image
                 }));
                 setResources(mappedResources);
             } else {
                 // DB is empty, Seed it!
                 console.log("ArenaOS: Database empty. Seeding resources...");
                 await seedDatabase();
             }

             // 2. Fetch Bookings
             const { data: bkData } = await supabase.from('bookings').select('*');
             if (bkData) {
                  const mappedBookings = bkData.map((b: any) => ({
                      id: b.id,
                      tenantId: b.tenant_id,
                      resourceId: b.resource_id,
                      userId: b.user_id,
                      date: b.date,
                      startTime: b.start_time,
                      duration: b.duration,
                      status: b.status,
                      totalAmount: b.total_amount,
                      qrCode: b.qr_code,
                      paymentQr: b.payment_qr,
                      quantity: b.quantity
                  }));
                  setBookings(mappedBookings);
             }
             
             // 3. Fetch Transactions
             const { data: txData } = await supabase.from('transactions').select('*');
             if(txData) {
                  const mappedTx = txData.map((t: any) => ({
                      id: t.id,
                      bookingId: t.booking_id,
                      userId: t.user_id,
                      amount: t.amount,
                      date: t.date,
                      type: t.type,
                      status: t.status,
                      method: t.method,
                      reference: t.reference
                  }));
                  setTransactions(mappedTx);
             }

          } else {
              console.error("ArenaOS: Supabase Connection Error:", resError);
          }

        } catch (e) {
          console.warn("Supabase connection failed or empty, falling back to mocks", e);
          setIsSupabaseConnected(false);
        }
      }

      // Fallback: If no supabase connection or empty bookings, use dummy bookings for demo
      if (!isSupabaseConnected && bookings.length === 0) {
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
      }
    };

    initData();
  }, []);

  const seedDatabase = async () => {
    if (!supabase) return;
    
    // Seed Resources
    const { error: seedError } = await supabase.from('resources').insert(
        MOCK_RESOURCES.map(r => ({
            id: r.id,
            tenant_id: r.tenantId,
            name: r.name,
            type: r.type,
            mode: r.mode,
            capacity: r.capacity,
            hourly_rate: r.hourlyRate,
            image: r.image
        }))
    );
    
    if (seedError) {
        console.error("Failed to seed resources:", seedError);
    } else {
        console.log("Resources seeded successfully!");
        setResources(MOCK_RESOURCES); // Update local state to match
    }
  };

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
      const rateCard = rateCards.find(rc => rc.resourceType === resource.type);
      let rate = resource.hourlyRate;
      if (rateCard) {
          rate = rateCard.baseRate;
          if (rateCard.peakHours.includes(hour)) {
              rate = rateCard.peakRate;
          }
      }
      return rate * duration;
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'qrCode' | 'paymentQr'>): Promise<Booking> => {
    
    // Recalculate price
    const dynamicPrice = calculatePrice(bookingData.resourceId, bookingData.date, bookingData.startTime, bookingData.duration) * (bookingData.quantity || 1);

    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${Date.now()}`,
      status: BookingStatus.CONFIRMED,
      qrCode: `ENTRY-${Date.now()}`,
      paymentQr: `PAY-${Date.now()}`,
      totalAmount: dynamicPrice
    };

    // Optimistic Update
    setBookings(prev => [...prev, newBooking]);

    // Supabase Insert
    if (supabase && isSupabaseConnected) {
        console.log("Uploading booking to Supabase...");
        const { error } = await supabase.from('bookings').insert({
            id: newBooking.id,
            tenant_id: newBooking.tenantId,
            resource_id: newBooking.resourceId,
            user_id: newBooking.userId,
            date: newBooking.date,
            start_time: newBooking.startTime,
            duration: newBooking.duration,
            status: newBooking.status,
            total_amount: newBooking.totalAmount,
            qr_code: newBooking.qrCode,
            payment_qr: newBooking.paymentQr,
            quantity: newBooking.quantity
        });
        if (error) console.error("Booking insert failed:", error);
    } else {
        // Fallback delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
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

    if (supabase && isSupabaseConnected) {
        await supabase.from('transactions').insert({
            id: newTx.id,
            booking_id: newTx.bookingId,
            user_id: newTx.userId,
            amount: newTx.amount,
            date: newTx.date,
            type: newTx.type,
            status: newTx.status,
            method: newTx.method,
            reference: newTx.reference
        });
    }

    return newBooking;
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    
    if (supabase && isSupabaseConnected) {
        await supabase.from('bookings').update({ status }).eq('id', bookingId);
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

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
            method: 'QR',
            reference: `REFUND-${booking.id}`
        };
        setTransactions(prev => [refundTx, ...prev]);
        
        if (supabase && isSupabaseConnected) {
            await supabase.from('transactions').insert({
                id: refundTx.id,
                booking_id: refundTx.bookingId,
                user_id: refundTx.userId,
                amount: refundTx.amount,
                date: refundTx.date,
                type: refundTx.type,
                status: refundTx.status,
                method: refundTx.method,
                reference: refundTx.reference
            });
        }
    }

    updateBookingStatus(bookingId, BookingStatus.CANCELLED);
  };

  const checkIn = (bookingId: string, lat?: number, lng?: number): { success: boolean; message: string } => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    if (lat && lng) {
        if (lat === 0 && lng === 0) {
            return { success: false, message: `GPS Check-in Failed: User too far from venue` };
        }
    }
    
    updateBookingStatus(bookingId, BookingStatus.CHECKED_IN);
    return { success: true, message: 'Check-in Successful' };
  };

  const updateTenantBranding = (branding: Partial<Tenant>) => {
    setTenant(prev => ({ ...prev, ...branding }));
  };

  const addResource = async (resource: Resource) => {
    setResources(prev => [...prev, resource]);
    if (supabase && isSupabaseConnected) {
        await supabase.from('resources').insert({
            id: resource.id,
            tenant_id: resource.tenantId,
            name: resource.name,
            type: resource.type,
            mode: resource.mode,
            capacity: resource.capacity,
            hourly_rate: resource.hourlyRate,
            image: resource.image
        });
    }
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
      isSupabaseConnected,
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

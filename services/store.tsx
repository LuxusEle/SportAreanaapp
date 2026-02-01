
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Fallback images map by resource type in case DB has nulls
const FALLBACK_IMAGES: Record<string, string> = {
  'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
  'Futsal': 'https://images.unsplash.com/photo-1575361204480-aadea252468e?q=80&w=800&auto=format&fit=crop',
  'Swimming': 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=800&auto=format&fit=crop',
  'Cricket': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800&auto=format&fit=crop'
};

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

  // Centralized Data Fetching
  const refreshData = useCallback(async () => {
    if (!supabase) return;
    
    try {
      // 1. Fetch Resources
      const { data: resData, error: resError } = await supabase.from('resources').select('*');
      
      if (!resError && resData) {
         if (resData.length > 0) {
             const mappedResources = resData.map((r: any) => ({
                 id: r.id,
                 tenantId: r.tenant_id,
                 name: r.name,
                 type: r.type,
                 mode: r.mode,
                 capacity: r.capacity,
                 hourlyRate: r.hourly_rate,
                 // Use DB image, or fallback to Mock if empty/null, or fallback to Generic based on Type
                 image: r.image || MOCK_RESOURCES.find(mr => mr.id === r.id)?.image || FALLBACK_IMAGES[r.type] || FALLBACK_IMAGES['default']
             }));
             setResources(mappedResources);
         } else {
             // DB connection good but table empty? Seed it.
             await seedDatabase();
         }
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
      
      setIsSupabaseConnected(true);

    } catch (e) {
      console.warn("ArenaOS: Error refreshing Supabase data", e);
      // Don't set connected false here, stick to last known good or initial check
    }
  }, []);

  // Initialize Data & Realtime Subscription
  useEffect(() => {
    const initData = async () => {
      if (supabase) {
        // Initial Fetch
        await refreshData();

        // Subscribe to changes
        const channel = supabase.channel('schema-db-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            () => { console.log('🔔 Bookings updated!'); refreshData(); }
          )
          .on(
             'postgres_changes',
             { event: '*', schema: 'public', table: 'resources' },
             () => { console.log('🔔 Resources updated!'); refreshData(); }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } else {
         // Fallback
         setBookings([
            {
              id: 'bk_demo_1',
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
            }
         ]);
      }
    };

    initData();
  }, [refreshData]);

  const seedDatabase = async () => {
    if (!supabase) return;
    console.log("ArenaOS: Seeding Database with Mock Data...");
    
    // Seed Resources
    const { error: seedError } = await supabase.from('resources').upsert(
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
        refreshData(); // Refresh to get the new data
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

    if (supabase && isSupabaseConnected) {
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
    updateBookingStatus(bookingId, BookingStatus.CANCELLED);
  };

  const checkIn = (bookingId: string, lat?: number, lng?: number): { success: boolean; message: string } => {
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
      verifyTransaction,
      refreshData
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

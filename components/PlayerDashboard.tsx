
import React, { useState } from 'react';
import { useApp } from '../services/store';
import { Resource, Booking, BookingStatus, ResourceMode, PaymentStatus, User } from '../types';
import { Calendar, Clock, CheckCircle, Search, MapPin, QrCode, ArrowRight, User as UserIcon, Package, AlertCircle, Users, X, CreditCard, Receipt, AlertTriangle, ImageOff, Navigation, ChevronLeft, TrendingUp, Activity, Award, Phone, Mail, ShoppingBag, Dumbbell, Link as LinkIcon, Edit2, Camera, Shield, Zap } from 'lucide-react';

interface PlayerDashboardProps {
  activeTab: string;
  navigateTo: (tab: string) => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ activeTab, navigateTo }) => {
  const { resources, bookings, transactions, currentUser, createBooking, tenant, cancelBooking, policies, rateCards, trainers, merchandise, classes, packages, joinBooking, topUpWallet } = useApp();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookingStep, setBookingStep] = useState<'SELECT' | 'TIME' | 'QUANTITY' | 'EXTRAS' | 'PAYMENT' | 'SUCCESS'>('SELECT');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedTrainer, setSelectedTrainer] = useState<User | null>(null);
  const [generatedBooking, setGeneratedBooking] = useState<Booking | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '', phone: '+1 234 567 8900', bio: 'Passionate athlete.' });

  const myBookings = bookings.filter(b => b.userId === currentUser?.id).sort((a, b) => b.id.localeCompare(a.id));
  const myTransactions = transactions.filter(t => t.userId === currentUser?.id).sort((a, b) => b.date.localeCompare(a.date));

  const toggleSlot = (hour: number) => {
    setSelectedSlots(prev => prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour]);
  };

  const getRateForHour = (hour: number) => {
    if (!selectedResource) return 0;
    const rateCard = rateCards.find(rc => rc.resourceType === selectedResource.type);
    let rate = selectedResource.hourlyRate;
    if (rateCard) {
        rate = rateCard.baseRate;
        if (rateCard.peakHours.includes(hour)) rate = rateCard.peakRate;
    }
    return rate;
  };

  const resourcePrice = selectedSlots.reduce((acc, hour) => acc + getRateForHour(hour), 0) * selectedQuantity;
  const trainerPrice = selectedTrainer ? (selectedSlots.length * 500) : 0; // Flat 500 per hour for trainer
  const totalCumulativePrice = resourcePrice + trainerPrice;

  const handleBook = async () => {
    if (!selectedResource || selectedSlots.length === 0 || !currentUser) return;
    setIsProcessingPayment(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const bookingsCreated: Booking[] = [];
    for (const hour of selectedSlots) {
       const b = await createBooking({
        tenantId: tenant.id,
        resourceId: selectedResource.id,
        userId: currentUser.id,
        date: selectedDate,
        startTime: hour,
        duration: 1,
        quantity: selectedQuantity,
        totalAmount: 0 // Will be recalculated by store for single items, but here we handled bundle logic visually
      });
      bookingsCreated.push(b);
    }
    if (bookingsCreated.length > 0) {
        setGeneratedBooking(bookingsCreated[0]);
        setIsProcessingPayment(false);
        setBookingStep('SUCCESS');
    }
  };

  const handleCancel = (booking: Booking) => {
    const confirmMessage = `Cancellation Policy: \nRefunds: ${policies.refundPercentage}% \nCancel Window: ${policies.cancelWindowHrs}hrs\n\nProceed?`;
    if (confirm(confirmMessage)) cancelBooking(booking.id);
  };

  const handleJoinMatch = () => {
      if(!joinCode) return;
      const success = joinBooking(joinCode);
      if(success) {
          alert(`Successfully joined the match! View details in 'My Bookings'.`);
          navigateTo('my-bookings');
      } else {
          alert('Invalid Match Code or Match is full.');
      }
  };

  const handleBuyPackage = (pkg: any) => {
      if (confirm(`Buy ${pkg.name} for ${tenant.currency} ${pkg.price}?`)) {
          topUpWallet(pkg.price, pkg.credits);
          alert(`Successfully added ${pkg.credits} credits to your wallet!`);
      }
  };

  // --- BOOKING WIZARD OVERLAY ---
  // If we are in the booking flow (step != SELECT), we return the wizard components regardless of the tab active state
  // to ensure it renders "on top" or replaces the view.
  if (bookingStep !== 'SELECT' && selectedResource) {
      if (bookingStep === 'TIME') {
        return (
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setBookingStep('SELECT')} className="text-gray-500 mb-6 hover:text-white font-bold flex items-center transition-colors">
                <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to Resources
            </button>
            
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-depth-dark overflow-hidden border border-white/10">
               <div className="h-48 bg-gray-800 relative overflow-hidden group">
                  <img src={selectedResource.image} className="w-full h-full object-cover opacity-60" alt={selectedResource.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                     <h2 className="text-3xl font-extrabold mb-1">{selectedResource.name}</h2>
                     <p className="opacity-90 font-medium flex items-center text-gray-300"><MapPin className="w-4 h-4 mr-1"/> {tenant.location.address}</p>
                  </div>
               </div>

               <div className="p-8">
                 <div className="mb-8">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Select Date</label>
                   <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 bg-black/40 border border-white/10 rounded-xl font-bold text-white focus:border-indigo-500 focus:outline-none transition-all shadow-inner"/>
                 </div>

                 <div className="mb-8">
                   <div className="flex justify-between items-center mb-3">
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Available Slots</label>
                       <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded border border-indigo-400/20">{selectedSlots.length} Selected</span>
                   </div>
                   
                   <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                     {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => {
                       const currentBookings = bookings.filter(b => b.resourceId === selectedResource?.id && b.date === selectedDate && b.startTime === hour && b.status !== BookingStatus.CANCELLED);
                       const isFull = currentBookings.reduce((acc, curr) => acc + (curr.quantity || 1), 0) >= selectedResource.capacity;
                       const isSelected = selectedSlots.includes(hour);
                       
                       return (
                         <button key={hour} disabled={isFull} onClick={() => toggleSlot(hour)}
                           className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 relative overflow-hidden border ${
                               isFull ? 'bg-gray-800 text-gray-600 border-transparent cursor-not-allowed' : isSelected ? 'bg-indigo-600 text-white border-indigo-500 shadow-glow-indigo scale-105' : 'bg-gray-900 border-white/10 text-gray-300 hover:border-indigo-400 hover:text-indigo-400'
                            }`}>
                           {hour}:00
                         </button>
                       );
                     })}
                   </div>
                 </div>

                 <button onClick={() => { if (selectedResource.mode === ResourceMode.SHARED) { setBookingStep('QUANTITY'); } else { setBookingStep('EXTRAS'); }}} disabled={selectedSlots.length === 0} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-extrabold text-lg shadow-lg disabled:opacity-50 hover:scale-[1.01] transition-all">
                    Continue
                 </button>
               </div>
            </div>
          </div>
        );
      }

      if (bookingStep === 'QUANTITY') {
          return (
              <div className="max-w-md mx-auto mt-10">
                  <button onClick={() => setBookingStep('TIME')} className="flex items-center text-gray-500 mb-6 font-bold hover:text-white"><ChevronLeft className="w-4 h-4 mr-1"/> Back</button>
                  <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-depth-dark p-8 text-center border border-white/10">
                      <h2 className="text-2xl font-extrabold text-white mb-6">How many spots?</h2>
                      <div className="flex items-center justify-center space-x-6 mb-8">
                          <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold text-white hover:bg-gray-700 transition-colors">-</button>
                          <span className="text-5xl font-extrabold text-indigo-400">{selectedQuantity}</span>
                          <button onClick={() => setSelectedQuantity(Math.min(selectedResource.capacity, selectedQuantity + 1))} className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold text-white hover:bg-gray-700 transition-colors">+</button>
                      </div>
                      <button onClick={() => setBookingStep('EXTRAS')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-glow-indigo">Continue</button>
                  </div>
              </div>
          )
      }

      if (bookingStep === 'EXTRAS') {
          return (
              <div className="max-w-2xl mx-auto mt-10">
                  <button onClick={() => setBookingStep('TIME')} className="flex items-center text-gray-500 mb-6 font-bold hover:text-white"><ChevronLeft className="w-4 h-4 mr-1"/> Back</button>
                  <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-depth-dark p-8 border border-white/10">
                      <h2 className="text-2xl font-extrabold text-white mb-6">Add Extras</h2>
                      
                      <div className="mb-8">
                          <h3 className="font-bold text-gray-400 mb-4 flex items-center"><Dumbbell className="w-5 h-5 mr-2"/> Add a Professional Coach?</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div 
                                onClick={() => setSelectedTrainer(null)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTrainer === null ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-black/20 hover:border-white/30'}`}
                              >
                                  <div className="font-bold text-white">No Coach</div>
                                  <div className="text-xs text-gray-500">Just the arena</div>
                              </div>
                              {trainers.map(tr => (
                                  <div 
                                    key={tr.id}
                                    onClick={() => setSelectedTrainer(tr)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedTrainer?.id === tr.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-black/20 hover:border-white/30'}`}
                                  >
                                      <div>
                                          <div className="font-bold text-white">{tr.name}</div>
                                          <div className="text-xs text-gray-500">Professional Trainer</div>
                                      </div>
                                      <div className="text-right">
                                          <div className="font-bold text-green-400">+500</div>
                                          <div className="text-[10px] text-gray-600">/session</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <button onClick={() => setBookingStep('PAYMENT')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-glow-indigo">Continue to Checkout</button>
                  </div>
              </div>
          )
      }

      if (bookingStep === 'PAYMENT') {
        return (
          <div className="max-w-md mx-auto mt-10">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-depth-dark p-8 text-center border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-400" />
              
              <h2 className="text-2xl font-extrabold text-white mb-8">Checkout</h2>
              
              <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                 <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                    <span className="text-gray-400 font-medium">Resource</span>
                    <span className="font-bold text-white">{selectedResource.name}</span>
                 </div>
                 <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                    <span className="text-gray-400 font-medium">Date & Time</span>
                    <span className="font-bold text-white text-right">{selectedDate}<br/><span className="text-xs font-normal text-gray-500">{selectedSlots.join(', ')}:00</span></span>
                 </div>
                 {selectedTrainer && (
                     <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10">
                        <span className="text-gray-400 font-medium">Coach</span>
                        <span className="font-bold text-white">{selectedTrainer.name} <span className="text-green-400 text-xs">(+{trainerPrice})</span></span>
                     </div>
                 )}
                 <div className="flex justify-between items-center text-xl mt-4">
                    <span className="text-white font-bold">Total</span>
                    <span className="font-extrabold text-indigo-400">{tenant.currency} {totalCumulativePrice}.00</span>
                 </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleBook}
                  disabled={isProcessingPayment}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex justify-center items-center shadow-lg"
                >
                  {isProcessingPayment ? <span className="animate-pulse">Processing...</span> : "Confirm Payment"}
                </button>
                <button onClick={() => setBookingStep('TIME')} className="text-gray-500 font-bold text-sm hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        );
      }

      if (bookingStep === 'SUCCESS' && generatedBooking) {
        return (
          <div className="max-w-md mx-auto mt-10">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-depth-dark p-10 text-center border border-white/10 relative">
              <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-800">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Bookings Confirmed!</h2>
              <p className="text-gray-500 mb-6">Your match is set. Check 'My Bookings' for entry code.</p>
              <div className="bg-black/30 p-4 rounded-xl mb-6 border border-white/5">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Match Code</p>
                  <p className="text-2xl font-mono text-indigo-400 tracking-widest">{generatedBooking.qrCode}</p>
                  <p className="text-[10px] text-gray-600 mt-2">Share this code with teammates to let them join.</p>
              </div>
              <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setBookingStep('SELECT');
                      setSelectedResource(null);
                      setSelectedSlots([]);
                      setSelectedTrainer(null);
                      navigateTo('explore');
                    }}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
                  >
                    Back to Home
                  </button>
              </div>
            </div>
          </div>
        );
      }
  }

  // --- DASHBOARD HOME (3D Widgets) ---
  if (activeTab === 'explore') {
    return (
      <div className="space-y-10">
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
               <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Hello, {currentUser?.name.split(' ')[0]}</h1>
               <p className="text-gray-500 dark:text-gray-400 font-medium">Ready to play today?</p>
            </div>
            
            {/* Join Game Widget */}
            <div className="flex items-center bg-gray-900 rounded-2xl p-2 border border-white/10 shadow-lg w-full md:w-auto">
                <input 
                    type="text" 
                    placeholder="Enter Match Code" 
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    className="bg-transparent text-white px-4 py-2 outline-none w-full md:w-48 text-sm"
                />
                <button 
                    onClick={handleJoinMatch}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors whitespace-nowrap"
                >
                    Join Match
                </button>
            </div>
          </div>

          {/* 3D RAISED CLICKABLE WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div 
                onClick={() => navigateTo('my-bookings')}
                className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-6 text-white cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)] relative overflow-hidden group border border-indigo-500/30"
              >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all"><Calendar className="w-24 h-24" /></div>
                  <h3 className="text-lg font-bold opacity-90">Your Schedule</h3>
                  <p className="text-4xl font-extrabold mt-2 text-indigo-200">{myBookings.filter(b => b.status === BookingStatus.CONFIRMED).length} <span className="text-sm font-medium text-white/60">Games</span></p>
                  <div className="mt-4 flex items-center text-sm font-bold bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                      View Calendar <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
              </div>

              <div 
                onClick={() => navigateTo('packages')}
                className="bg-gray-800 dark:bg-gray-900 rounded-3xl p-6 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] border border-white/10 group relative"
              >
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Package className="w-24 h-24 text-white" /></div>
                   <h3 className="text-lg font-bold text-gray-400">Wallet</h3>
                   <p className="text-4xl font-extrabold mt-2 text-white">{tenant.currency} {currentUser?.credits || 0}</p>
                   <div className="mt-4 flex items-center text-sm font-bold text-indigo-400 group-hover:underline">
                      Top Up <ArrowRight className="w-4 h-4 ml-1" />
                   </div>
              </div>

              <div 
                onClick={() => navigateTo('profile')}
                className="bg-gray-800 dark:bg-gray-900 rounded-3xl p-6 cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] border border-white/10 group relative"
              >
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity className="w-24 h-24 text-white" /></div>
                   <h3 className="text-lg font-bold text-gray-400">Performance</h3>
                   <p className="text-4xl font-extrabold mt-2 text-green-500">Pro</p>
                   <div className="mt-4 flex items-center text-sm font-bold text-indigo-400 group-hover:underline">
                      View Stats <ArrowRight className="w-4 h-4 ml-1" />
                   </div>
              </div>
          </div>
          
          {/* Main Content Tabs - Mock implementation of merchandise/classes */}
          <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Explore Arena</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resources.map(resource => (
                  <div key={resource.id} className="group relative h-96 cursor-pointer" onClick={() => {
                      setSelectedResource(resource);
                      setBookingStep('TIME');
                  }}>
                     {/* 3D Card Effect */}
                    <div className="absolute inset-0 bg-gray-800 backdrop-blur-xl rounded-3xl transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1 z-0 shadow-lg border border-white/5"></div>
                    
                    <div className="absolute inset-0 bg-gray-900 rounded-3xl overflow-hidden z-10 border border-white/10 shadow-lg flex flex-col transition-transform duration-300 group-hover:-translate-y-2">
                       <div className="h-2/3 bg-gray-800 relative">
                          <img 
                              src={resource.image} 
                              alt={resource.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800'; }}
                          />
                          {/* Stronger overlay for brightness balance */}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-90" />
                          
                          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20 shadow-lg">
                              {resource.type}
                          </div>
                          <div className="absolute bottom-6 left-6 text-white">
                              <h3 className="text-2xl font-extrabold shadow-black drop-shadow-md">{resource.name}</h3>
                              <p className="text-gray-300 text-sm font-medium">{resource.mode.toLowerCase()} access</p>
                          </div>
                       </div>
                       <div className="flex-1 p-6 flex justify-between items-center bg-gray-900">
                          <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Rate</p>
                              <p className="text-2xl font-extrabold text-white">{tenant.currency} {resource.hourlyRate}<span className="text-sm font-medium text-gray-500">/hr</span></p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300 border border-white/10 group-hover:border-white">
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-black" />
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center"><ShoppingBag className="w-5 h-5 mr-2"/> Gear & Merchandise</h3>
                  <div className="space-y-4">
                      {merchandise.map(item => (
                          <div key={item.id} className="flex items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
                              <img src={item.image} className="w-16 h-16 rounded-xl object-cover bg-gray-200" />
                              <div className="ml-4 flex-1">
                                  <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                  <p className="text-sm text-gray-500">{tenant.currency} {item.price}</p>
                              </div>
                              <button className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10">Shop</button>
                          </div>
                      ))}
                  </div>
              </div>
              <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center"><Dumbbell className="w-5 h-5 mr-2"/> Classes & Training</h3>
                  <div className="space-y-4">
                      {classes.map(cls => (
                          <div key={cls.id} className="flex items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
                              <img src={cls.image} className="w-16 h-16 rounded-xl object-cover bg-gray-200" />
                              <div className="ml-4 flex-1">
                                  <h4 className="font-bold text-gray-900 dark:text-white">{cls.name}</h4>
                                  <p className="text-sm text-gray-500">{cls.instructor} • {cls.time}</p>
                              </div>
                              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-500">Join</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        </section>
      </div>
    );
  }

  // --- MY BOOKINGS VIEW ---
  if (activeTab === 'my-bookings') {
    const displayedBookings = showHistory 
        ? myBookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED)
        : myBookings.filter(b => b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED);

    return (
      <section className="max-w-4xl mx-auto">
        <button onClick={() => navigateTo('explore')} className="mb-6 flex items-center text-gray-500 hover:text-white transition-colors font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard</button>
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{showHistory ? 'Booking History' : 'Upcoming Games'}</h2>
           <button 
             onClick={() => setShowHistory(!showHistory)}
             className={`text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-colors ${showHistory ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 border border-white/10'}`}
           >
             {showHistory ? 'View Upcoming' : 'View History'}
           </button>
        </div>
        
        {displayedBookings.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-white/10 shadow-lg">
            <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-300">No {showHistory ? 'past' : 'upcoming'} bookings</h3>
            <p className="text-gray-500 mb-6">You haven't booked any sessions yet.</p>
            <button 
              onClick={() => navigateTo('explore')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-colors"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedBookings.map((booking) => {
              const res = resources.find(r => r.id === booking.resourceId);
              return (
                <div key={booking.id} className="group relative">
                  <div className="absolute inset-0 bg-white/5 rounded-2xl blur-sm group-hover:bg-indigo-600/10 transition-all duration-300" />
                  <div className="relative bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="flex items-center space-x-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black border border-white/10 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                        <span className="text-xl font-bold text-indigo-400">{booking.startTime}:00</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-lg text-white">{res?.name || 'Unknown Resource'}</h4>
                        <div className="flex items-center text-sm text-gray-400 mt-1 space-x-3">
                           <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {booking.date}</span>
                           <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {booking.duration}h</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                       <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          booking.status === BookingStatus.CONFIRMED ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {booking.status.replace('_', ' ')}
                       </div>
                       
                       {booking.status === BookingStatus.CONFIRMED && (
                         <>
                           <button 
                             onClick={() => alert(`Entry Pass QR Code:\n\n${booking.qrCode}\n\nPresent this at the venue scanner.`)}
                             className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-colors"
                           >
                             <QrCode className="w-4 h-4" />
                             <span>Entry Pass</span>
                           </button>
                           <button onClick={() => handleCancel(booking)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                             <X className="w-5 h-5" />
                           </button>
                         </>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  // --- PACKAGES / WALLET VIEW ---
  if (activeTab === 'packages') {
      return (
          <div className="max-w-5xl mx-auto space-y-10">
              <button onClick={() => navigateTo('explore')} className="flex items-center text-gray-500 hover:text-indigo-400 transition-colors font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard</button>
              
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-extrabold text-white mb-2">Credit Packages</h2>
                  <p className="text-gray-400">Buy credits upfront and get bonuses. Use credits to book courts instantly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {packages.map(pkg => (
                      <div key={pkg.id} className="relative group cursor-pointer" onClick={() => handleBuyPackage(pkg)}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${pkg.color} rounded-3xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500`}></div>
                          <div className="relative bg-gray-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 h-full flex flex-col hover:-translate-y-2 transition-transform duration-300 shadow-xl">
                              <div className="mb-6">
                                  <h3 className="text-xl font-bold text-white mb-1">{pkg.name}</h3>
                                  <div className="text-3xl font-extrabold text-white">{tenant.currency} {pkg.price}</div>
                              </div>
                              
                              <div className="flex-1 space-y-4 mb-8">
                                  <div className="flex items-center text-gray-300">
                                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                      <span>{pkg.credits} Credits</span>
                                  </div>
                                  {pkg.bonus > 0 && (
                                      <div className="flex items-center text-yellow-400 font-bold">
                                          <Zap className="w-5 h-5 mr-3" />
                                          <span>+{pkg.bonus} Bonus Credits</span>
                                      </div>
                                  )}
                                  <div className="flex items-center text-gray-400 text-sm">
                                      <Shield className="w-4 h-4 mr-3" />
                                      <span>Valid for 1 year</span>
                                  </div>
                              </div>

                              <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/10">
                                  Purchase
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  // --- PAYMENTS & SUMMARY VIEW ---
  if (activeTab === 'payments') {
      const totalSpent = myTransactions.reduce((acc, t) => acc + (t.status === PaymentStatus.COMPLETED ? t.amount : 0), 0);
      const pendingAmount = myTransactions.reduce((acc, t) => acc + (t.status === PaymentStatus.PENDING ? t.amount : 0), 0);

      return (
          <div className="max-w-4xl mx-auto space-y-8">
              <button onClick={() => navigateTo('explore')} className="flex items-center text-gray-500 hover:text-indigo-400 transition-colors font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard</button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 text-white shadow-lg border-l-4 border-green-500">
                      <p className="font-bold opacity-80 mb-2 text-gray-400">Total Spent</p>
                      <h3 className="text-4xl font-extrabold">{tenant.currency} {totalSpent}</h3>
                  </div>
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 text-white shadow-lg border-l-4 border-orange-500">
                      <p className="font-bold opacity-80 mb-2 text-gray-400">Pending</p>
                      <h3 className="text-4xl font-extrabold">{tenant.currency} {pendingAmount}</h3>
                  </div>
              </div>

              <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-depth-dark">
                  <div className="p-6 border-b border-white/10">
                      <h3 className="font-bold text-lg text-white">Transaction History</h3>
                  </div>
                  <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 text-xs uppercase font-bold text-gray-500">
                          <tr>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Reference</th>
                              <th className="px-6 py-4">Amount</th>
                              <th className="px-6 py-4">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {myTransactions.map(tx => (
                              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-6 py-4 text-gray-300">{tx.date}</td>
                                  <td className="px-6 py-4 font-mono text-gray-500">{tx.reference}</td>
                                  <td className="px-6 py-4 font-bold text-white">{tenant.currency} {tx.amount}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.status === PaymentStatus.COMPLETED ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'}`}>
                                          {tx.status}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )
  }

  // --- FULL PROFILE VIEW ---
  if (activeTab === 'profile') {
      return (
          <div className="max-w-4xl mx-auto space-y-8">
               <button onClick={() => navigateTo('explore')} className="flex items-center text-gray-500 hover:text-white transition-colors font-bold"><ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard</button>
               
               <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row gap-8 items-start shadow-depth-dark relative overflow-hidden">
                   {/* Decorative background glow */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>

                   <div className="flex flex-col items-center z-10">
                       <div className="w-32 h-32 rounded-full border-4 border-gray-700 shadow-xl overflow-hidden mb-4 p-1 bg-gray-800 relative group">
                           <img src={currentUser?.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                               <Camera className="w-8 h-8 text-white"/>
                           </div>
                       </div>
                       <button className="text-sm font-bold text-indigo-400 hover:underline">Change Photo</button>
                   </div>
                   
                   <div className="flex-1 w-full z-10">
                       <div className="flex justify-between items-start mb-6">
                           <div>
                               {isEditingProfile ? (
                                   <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="bg-transparent border-b border-indigo-500 text-3xl font-extrabold text-white outline-none mb-1" autoFocus/>
                               ) : (
                                   <h2 className="text-3xl font-extrabold text-white">{profileForm.name}</h2>
                               )}
                               <p className="text-gray-400 font-medium">{currentUser?.email}</p>
                           </div>
                           <button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center space-x-2 ${isEditingProfile ? 'bg-green-600 text-white' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}`}>
                               {isEditingProfile ? <CheckCircle className="w-4 h-4"/> : <Edit2 className="w-4 h-4"/>}
                               <span>{isEditingProfile ? 'Save' : 'Edit'}</span>
                           </button>
                       </div>

                       <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Personal Details</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div>
                                   <p className="text-xs text-gray-400 mb-1">Phone Number</p>
                                   {isEditingProfile ? (
                                       <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="bg-transparent border-b border-gray-600 text-white font-bold w-full outline-none"/>
                                   ) : (
                                       <div className="flex items-center font-bold text-gray-200"><Phone className="w-4 h-4 mr-2 opacity-50"/> {profileForm.phone}</div>
                                   )}
                               </div>
                               <div>
                                   <p className="text-xs text-gray-400 mb-1">Member ID</p>
                                   <div className="flex items-center font-bold text-gray-200"><Award className="w-4 h-4 mr-2 opacity-50"/> #PLAYER-8832</div>
                               </div>
                               <div className="col-span-2">
                                   <p className="text-xs text-gray-400 mb-1">Bio</p>
                                   {isEditingProfile ? (
                                       <textarea value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="bg-transparent border-b border-gray-600 text-white w-full outline-none h-20"/>
                                   ) : (
                                       <p className="text-gray-300 italic">"{profileForm.bio}"</p>
                                   )}
                               </div>
                           </div>
                       </div>
                       
                       <h3 className="font-bold text-lg text-white mb-4">Activity Heatmap</h3>
                       <div className="flex space-x-1 h-12 items-end">
                           {[...Array(28)].map((_, i) => (
                               <div key={i} className={`flex-1 rounded-sm transition-all hover:scale-110 ${Math.random() > 0.6 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-gray-800'}`} style={{height: `${Math.random() * 100}%`}} title="Activity"></div>
                           ))}
                       </div>
                   </div>
               </div>
          </div>
      )
  }

  return (
    <div>Error: State fell through.</div>
  );
};


import React, { useState } from 'react';
import { useApp } from '../services/store';
import { Resource, Booking, BookingStatus, ResourceMode } from '../types';
import { Calendar, Clock, CheckCircle, Search, MapPin, QrCode, ArrowRight, User as UserIcon, Package, AlertCircle, Users, X, CreditCard, Receipt, AlertTriangle, ImageOff, Navigation } from 'lucide-react';

interface PlayerDashboardProps {
  activeTab: string;
  navigateTo: (tab: string) => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ activeTab, navigateTo }) => {
  const { resources, bookings, transactions, currentUser, createBooking, tenant, cancelBooking, policies, rateCards } = useApp();
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookingStep, setBookingStep] = useState<'SELECT' | 'TIME' | 'QUANTITY' | 'PAYMENT' | 'SUCCESS'>('SELECT');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Changed from single number to array of numbers for multi-slot support
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [generatedBooking, setGeneratedBooking] = useState<Booking | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const myBookings = bookings.filter(b => b.userId === currentUser?.id).sort((a, b) => b.id.localeCompare(a.id));
  const myTransactions = transactions.filter(t => t.userId === currentUser?.id).sort((a, b) => b.date.localeCompare(a.date));

  const toggleSlot = (hour: number) => {
    setSelectedSlots(prev => {
      if (prev.includes(hour)) {
        return prev.filter(h => h !== hour);
      } else {
        return [...prev, hour];
      }
    });
  };

  // Helper to calculate cost for a specific hour
  const getRateForHour = (hour: number) => {
    if (!selectedResource) return 0;
    const rateCard = rateCards.find(rc => rc.resourceType === selectedResource.type);
    let rate = selectedResource.hourlyRate;
    if (rateCard) {
        rate = rateCard.baseRate;
        if (rateCard.peakHours.includes(hour)) {
            rate = rateCard.peakRate;
        }
    }
    return rate;
  };

  // Calculate cumulative price
  const totalCumulativePrice = selectedSlots.reduce((acc, hour) => acc + getRateForHour(hour), 0) * selectedQuantity;

  const handleBook = async () => {
    if (!selectedResource || selectedSlots.length === 0 || !currentUser) return;
    setIsProcessingPayment(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create bookings for EACH selected slot (Batch booking)
    const bookingsCreated: Booking[] = [];
    
    for (const hour of selectedSlots) {
       const b = await createBooking({
        tenantId: tenant.id,
        resourceId: selectedResource.id,
        userId: currentUser.id,
        date: selectedDate,
        startTime: hour,
        duration: 1, // Single hour blocks
        quantity: selectedQuantity,
        totalAmount: 0 // Logic handles this, but visual display used cumulative
      });
      bookingsCreated.push(b);
    }

    // Set one as reference for Success screen
    if (bookingsCreated.length > 0) {
        setGeneratedBooking(bookingsCreated[0]);
        setIsProcessingPayment(false);
        setBookingStep('SUCCESS');
    }
  };

  const handleCancel = (booking: Booking) => {
    const confirmMessage = `Cancellation Policy: \nRefunds: ${policies.refundPercentage}% \nCancel Window: ${policies.cancelWindowHrs}hrs\n\nProceed?`;
    if (confirm(confirmMessage)) {
      cancelBooking(booking.id);
    }
  };

  const handleDownloadReceipt = () => {
    alert("Receipt downloaded successfully!");
  };

  const handleNavigate = () => {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${tenant.location.lat},${tenant.location.lng}`, '_blank');
  };

  // --- MY BOOKINGS VIEW ---
  if (activeTab === 'my-bookings') {
    const displayedBookings = showHistory 
        ? myBookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED)
        : myBookings.filter(b => b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED);

    return (
      <section className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{showHistory ? 'Booking History' : 'Upcoming Sessions'}</h2>
           <button 
             onClick={() => setShowHistory(!showHistory)}
             className={`text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-colors ${showHistory ? 'bg-indigo-600 text-white shadow-glow-indigo' : 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900'}`}
           >
             {showHistory ? 'View Upcoming' : 'View History'}
           </button>
        </div>
        
        {displayedBookings.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-white/5 shadow-card-light dark:shadow-card-dark">
            <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No {showHistory ? 'past' : 'upcoming'} bookings</h3>
            <p className="text-gray-500 mb-6">You haven't booked any sessions yet.</p>
            <button 
              onClick={() => navigateTo('explore')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-glow-indigo hover:bg-indigo-500 transition-colors"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedBookings.map((booking, idx) => {
              const res = resources.find(r => r.id === booking.resourceId);
              return (
                <div key={booking.id} className="group relative">
                  <div className="absolute inset-0 bg-white dark:bg-white/5 rounded-2xl blur-sm group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all duration-300" />
                  <div className="relative bg-white dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="flex items-center space-x-5">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                        <span className="text-xl font-bold">{booking.startTime}:00</span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-lg text-gray-900 dark:text-white">{res?.name || 'Unknown Resource'}</h4>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-3">
                           <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {booking.date}</span>
                           <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {booking.duration}h</span>
                           {booking.quantity && booking.quantity > 1 && (
                               <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {booking.quantity} Guests</span>
                           )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                       <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' :
                          booking.status === BookingStatus.CHECKED_IN ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                          booking.status === BookingStatus.CANCELLED ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {booking.status.replace('_', ' ')}
                       </div>
                       
                       {booking.status === BookingStatus.CONFIRMED && (
                         <>
                           <button 
                             onClick={() => alert(`Entry Pass QR Code:\n\n${booking.qrCode}\n\nPresent this at the venue scanner.`)}
                             className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-glow-indigo hover:bg-indigo-700 transition-colors"
                           >
                             <QrCode className="w-4 h-4" />
                             <span>Entry Pass</span>
                           </button>
                           <button onClick={() => handleCancel(booking)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors">
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

  // --- BOOKING LOGIC ---

  if (bookingStep === 'TIME' && selectedResource) {
    return (
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setBookingStep('SELECT')} className="text-gray-500 dark:text-gray-400 mb-6 hover:text-indigo-500 dark:hover:text-indigo-400 font-bold flex items-center transition-colors">
            <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to Resources
        </button>
        
        <div className="bg-white dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-depth-light dark:shadow-depth-dark overflow-hidden border border-gray-100 dark:border-white/10">
           {/* Header Image Part */}
           <div className="h-48 bg-gray-200 dark:bg-gray-800 relative overflow-hidden group">
              {selectedResource.image ? (
                  <img 
                    src={selectedResource.image} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={selectedResource.name}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800'; // Fallback
                    }}
                  />
              ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                      <ImageOff className="w-12 h-12" />
                  </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                 <h2 className="text-3xl font-extrabold mb-1">{selectedResource.name}</h2>
                 <p className="opacity-90 font-medium flex items-center"><MapPin className="w-4 h-4 mr-1"/> {tenant.location.address}</p>
              </div>
              
              {/* Navigate Button */}
              <button 
                onClick={handleNavigate}
                className="absolute top-6 right-6 bg-indigo-600/90 hover:bg-indigo-600 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white font-bold flex items-center space-x-2 shadow-lg hover:scale-105 transition-all"
              >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate</span>
              </button>

              <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white font-bold">
                 From {tenant.currency} {selectedResource.hourlyRate}/hr
              </div>
           </div>

           <div className="p-8">
             <div className="mb-8">
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Select Date</label>
               <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/50 focus:border-indigo-500 focus:outline-none transition-all shadow-inner placeholder-gray-400 dark:placeholder-gray-600"/>
             </div>

             <div className="mb-8">
               <div className="flex justify-between items-center mb-3">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Available Slots</label>
                   <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">{selectedSlots.length} Selected</span>
               </div>
               
               <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                 {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(hour => {
                   const currentBookings = bookings.filter(b => b.resourceId === selectedResource.id && b.date === selectedDate && b.startTime === hour && b.status !== BookingStatus.CANCELLED);
                   const utilized = currentBookings.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                   const isFull = utilized >= selectedResource.capacity;
                   const isSelected = selectedSlots.includes(hour);
                   
                   return (
                     <button key={hour} disabled={isFull} onClick={() => toggleSlot(hour)}
                       className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 relative overflow-hidden ${
                           isFull 
                             ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent' 
                             : isSelected 
                                ? 'bg-indigo-600 text-white shadow-glow-indigo scale-105 border border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700' 
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400'
                        }`}>
                       {hour}:00
                       {selectedResource.mode === ResourceMode.SHARED && !isFull && (<span className="block text-[10px] opacity-70">{selectedResource.capacity - utilized} left</span>)}
                     </button>
                   );
                 })}
               </div>
             </div>

             <button onClick={() => { if (selectedResource.mode === ResourceMode.SHARED) { setBookingStep('QUANTITY'); } else { setBookingStep('PAYMENT'); }}} disabled={selectedSlots.length === 0} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-extrabold text-lg shadow-glow-indigo disabled:opacity-50 disabled:shadow-none hover:scale-[1.01] transition-all">
                Continue ({selectedSlots.length} slots)
             </button>
           </div>
        </div>
      </div>
    );
  }

  // --- QUANTITY / PAYMENT / SUCCESS STEPS ---
  if (bookingStep === 'QUANTITY' && selectedResource) {
      return (
          <div className="max-w-md mx-auto mt-10">
              <div className="bg-white dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-depth-light dark:shadow-depth-dark p-8 text-center border border-gray-100 dark:border-white/10">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">How many spots per slot?</h2>
                  <div className="flex items-center justify-center space-x-6 mb-8">
                      <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">-</button>
                      <span className="text-5xl font-extrabold text-indigo-500">{selectedQuantity}</span>
                      <button onClick={() => setSelectedQuantity(Math.min(selectedResource.capacity, selectedQuantity + 1))} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">+</button>
                  </div>
                  <button onClick={() => setBookingStep('PAYMENT')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-glow-indigo">Continue to Payment</button>
              </div>
          </div>
      )
  }

  if (bookingStep === 'PAYMENT' && selectedResource) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-depth-light dark:shadow-depth-dark p-8 text-center border border-gray-100 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">Checkout</h2>
          
          <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-white/10">
             <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Resource</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedResource.name}</span>
             </div>
             <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Date</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{selectedDate}</span>
             </div>
             <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Slots</span>
                <div className="text-right">
                    {selectedSlots.sort((a,b)=>a-b).map(h => (
                        <span key={h} className="block font-bold text-gray-800 dark:text-gray-200">{h}:00</span>
                    ))}
                </div>
             </div>
             {selectedQuantity > 1 && (
                 <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Quantity</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{selectedQuantity}</span>
                 </div>
             )}
             <div className="flex justify-between items-center text-xl">
                <span className="text-gray-900 dark:text-white font-bold">Total</span>
                <span className="font-extrabold text-indigo-500 dark:text-indigo-400">{tenant.currency} {totalCumulativePrice}.00</span>
             </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleBook}
              disabled={isProcessingPayment}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex justify-center items-center shadow-glow-emerald"
            >
              {isProcessingPayment ? <span className="animate-pulse">Processing...</span> : "Confirm Payment"}
            </button>
            <button onClick={() => setBookingStep('TIME')} className="text-gray-500 font-bold text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (bookingStep === 'SUCCESS' && generatedBooking) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="bg-white dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-depth-light dark:shadow-depth-dark p-10 text-center border border-gray-100 dark:border-white/10 relative">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-200 dark:border-green-800">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Bookings Confirmed!</h2>
          <p className="text-gray-500 mb-6">{selectedSlots.length} slots successfully reserved.</p>
          <div className="space-y-3">
              <button 
                onClick={() => {
                  setBookingStep('SELECT');
                  setSelectedResource(null);
                  setSelectedSlots([]);
                  navigateTo('explore');
                }}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                Back to Home
              </button>
          </div>
        </div>
      </div>
    );
  }

  // --- EXPLORE VIEW ---
  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
             <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Let's Play</h1>
             <p className="text-gray-500 dark:text-gray-400 font-medium">Choose a court, pitch, or lane to get started.</p>
          </div>
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
            <input placeholder="Search resources..." className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all shadow-sm" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map(resource => (
            <div key={resource.id} className="group relative h-96 cursor-pointer" onClick={() => {
                setSelectedResource(resource);
                setBookingStep('TIME');
            }}>
               {/* 3D Card Effect */}
              <div className="absolute inset-0 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1 z-0 shadow-card-light dark:shadow-card-dark"></div>
              
              <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-3xl overflow-hidden z-10 border border-gray-100 dark:border-white/10 shadow-lg flex flex-col transition-transform duration-300 group-hover:-translate-y-2">
                 <div className="h-2/3 bg-gray-200 dark:bg-gray-800 relative">
                    {/* Robust Image Loading */}
                    <img 
                        src={resource.image} 
                        alt={resource.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=800';
                        }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-90" />
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold border border-white/10">
                        {resource.type}
                    </div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="text-2xl font-extrabold">{resource.name}</h3>
                        <p className="text-gray-300 text-sm font-medium">{resource.mode.toLowerCase()} access</p>
                    </div>
                 </div>
                 <div className="flex-1 p-6 flex justify-between items-center bg-white dark:bg-gray-900">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Rate</p>
                        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{tenant.currency} {resource.hourlyRate}<span className="text-sm font-medium text-gray-500">/hr</span></p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-400 group-hover:text-white" />
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

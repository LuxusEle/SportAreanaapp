
import React, { useState } from 'react';
import { useApp } from '../services/store';
import { BookingStatus, PaymentStatus } from '../types';
import { Search, CheckCircle, XCircle, QrCode, CreditCard, Clock, Calendar, AlertTriangle, UserPlus, Filter, Download, DollarSign, MapPin } from 'lucide-react';

interface StaffDashboardProps {
  activeTab: string;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ activeTab }) => {
  const { bookings, resources, checkIn, cancelBooking, transactions, verifyTransaction } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCashierQr, setShowCashierQr] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState('');
  const [gpsSimLat, setGpsSimLat] = useState<number>(34.0522); // Default to venue location
  const [gpsSimLng, setGpsSimLng] = useState<number>(-118.2437);

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === today);
  const checkedInCount = todayBookings.filter(b => b.status === BookingStatus.CHECKED_IN).length;

  const handleManualCheckIn = (bookingId: string) => {
    const result = checkIn(bookingId); // No GPS override
    setCheckInMsg(result.message);
    setTimeout(() => setCheckInMsg(''), 3000);
  };

  const handleGPSCheckIn = (bookingId: string) => {
      const result = checkIn(bookingId, gpsSimLat, gpsSimLng);
      setCheckInMsg(result.message);
      setTimeout(() => setCheckInMsg(''), 3000);
  }

  const filteredBookings = bookings.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg p-6 rounded-3xl shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10 flex flex-col justify-between h-32 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full"></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider z-10">Total Bookings</p>
           <p className="text-4xl font-extrabold text-gray-900 dark:text-white z-10">{todayBookings.length}</p>
        </div>
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg p-6 rounded-3xl shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10 flex flex-col justify-between h-32 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-bl-full"></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider z-10">Checked In</p>
           <p className="text-4xl font-extrabold text-green-600 dark:text-green-500 z-10">{checkedInCount}</p>
        </div>
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-lg p-6 rounded-3xl shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10 flex flex-col justify-between h-32 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-bl-full"></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider z-10">Pending</p>
           <p className="text-4xl font-extrabold text-orange-500 z-10">{todayBookings.length - checkedInCount}</p>
        </div>
      </div>

      {/* DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
         <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-depth-light dark:shadow-depth-dark border border-gray-100 dark:border-white/10 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-900 dark:text-white">Today's Schedule</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
               {todayBookings.map(booking => {
                   const res = resources.find(r => r.id === booking.resourceId);
                   return (
                     <div key={booking.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-white/5">
                             {booking.startTime}
                           </div>
                           <div>
                             <p className="font-bold text-gray-800 dark:text-gray-200">{res?.name}</p>
                             <p className="text-xs text-gray-500 font-medium">ID: {booking.id} • {booking.duration}h</p>
                           </div>
                        </div>
                        <div>
                           {booking.status === BookingStatus.CHECKED_IN ? (
                             <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full text-xs font-bold flex items-center">
                               <CheckCircle className="w-3 h-3 mr-1"/> IN
                             </span>
                           ) : (
                             <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-xs font-bold">
                               PENDING
                             </span>
                           )}
                        </div>
                     </div>
                   )
               })}
            </div>
         </div>
      )}

      {/* PAYMENTS MODULE */}
      {activeTab === 'payments' && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-depth-light dark:shadow-depth-dark border border-gray-100 dark:border-white/10 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Verification</h3>
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase font-bold text-xs">
                       <tr>
                          <th className="px-6 py-3">Ref ID</th>
                          <th className="px-6 py-3">Booking</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                       {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                             <td className="px-6 py-4 font-mono">{tx.reference}</td>
                             <td className="px-6 py-4">{tx.bookingId}</td>
                             <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${tx.amount}</td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'}`}>
                                   {tx.status}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                {tx.status === 'PENDING' && (
                                   <button onClick={() => verifyTransaction(tx.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                                      Verify
                                   </button>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
          </div>
      )}

      {/* POS / WALK-IN VIEW */}
      {activeTab === 'walkin' && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-depth-light dark:shadow-depth-dark border border-gray-100 dark:border-white/10 p-8">
          <div className="flex items-center space-x-3 mb-8 text-indigo-600 dark:text-indigo-400">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/30 rounded-xl">
               <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white">New Walk-in</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Resource</label>
              <select className="w-full p-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-indigo-500 transition-all">
                {resources.map(r => <option key={r.id} value={r.id} className="bg-white dark:bg-gray-900">{r.name} (${r.hourlyRate}/hr)</option>)}
              </select>
            </div>
            {/* ... other inputs ... */}
          </div>
          
          <div className="p-6 bg-gray-100 dark:bg-gradient-to-r dark:from-gray-800 dark:to-black rounded-2xl text-gray-900 dark:text-white mb-8 shadow-lg border border-gray-200 dark:border-white/10">
             <div className="flex justify-between items-center mb-4">
                <span className="opacity-70 font-medium">Total Amount</span>
                <span className="text-3xl font-extrabold">$50.00</span>
             </div>
             
             {!showCashierQr ? (
                 <button onClick={() => setShowCashierQr(true)} className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors flex justify-center items-center space-x-2">
                    <QrCode className="w-5 h-5"/>
                    <span>Generate Payment QR</span>
                 </button>
             ) : (
                 <div className="text-center animate-in fade-in zoom-in duration-300">
                     <div className="bg-white p-4 rounded-xl inline-block mb-4">
                        <QrCode className="w-32 h-32 text-black" />
                     </div>
                     <p className="text-yellow-600 dark:text-yellow-400 font-bold animate-pulse mb-4">Waiting for customer payment...</p>
                     <button onClick={() => { setShowCashierQr(false); alert("Payment Confirmed!"); }} className="bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-6 py-2 rounded-xl font-bold">
                        Manual Confirm
                     </button>
                 </div>
             )}
          </div>
        </div>
      )}

      {/* CHECKIN VIEW with GPS Sim */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black rounded-3xl p-8 flex flex-col items-center justify-center text-white h-[28rem] relative overflow-hidden shadow-2xl border border-gray-800">
            <p className="mt-8 font-mono text-green-400 text-sm animate-pulse">● CAMERA ACTIVE</p>
            {checkInMsg && (
                <div className={`absolute top-4 left-4 right-4 p-4 rounded-xl text-center font-bold ${checkInMsg.includes('Success') ? 'bg-green-500' : 'bg-red-500'}`}>
                    {checkInMsg}
                </div>
            )}
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-depth-light dark:shadow-depth-dark border border-gray-100 dark:border-white/10 flex flex-col h-[28rem] p-6">
             <h3 className="font-bold text-gray-900 dark:text-white mb-4">Simulate GPS Check-in</h3>
             <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl mb-4 border border-gray-200 dark:border-white/5">
                 <div className="flex items-center space-x-2 mb-2">
                     <MapPin className="w-4 h-4 text-gray-500" />
                     <span className="text-xs font-bold text-gray-500 uppercase">Current Location Simulation</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                     <input type="number" value={gpsSimLat} onChange={e => setGpsSimLat(Number(e.target.value))} className="p-2 rounded bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" placeholder="Lat" />
                     <input type="number" value={gpsSimLng} onChange={e => setGpsSimLng(Number(e.target.value))} className="p-2 rounded bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white" placeholder="Lng" />
                 </div>
                 <div className="mt-2 text-xs text-gray-500">Target Venue: 34.0522, -118.2437</div>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {todayBookings.map(b => (
                    <div key={b.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <span className="font-bold text-sm text-gray-600 dark:text-gray-300">{b.id}</span>
                        <button onClick={() => handleGPSCheckIn(b.id)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded font-bold transition-colors">GPS Check-in</button>
                    </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { MOCK_TRAINEES } from '../constants';
import { useApp } from '../services/store';
import { Calendar, Clock, User, CheckCircle, XCircle, MoreVertical, ClipboardList } from 'lucide-react';
import { BookingStatus } from '../types';

interface TrainerDashboardProps {
  activeTab: string;
  navigateTo: (tab: string) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ activeTab, navigateTo }) => {
  const { bookings, resources, currentUser, updateBookingStatus } = useApp();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  // State for availability grid (Set of strings "Day-Hour")
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set(['Mon-9', 'Wed-14']));

  const upcomingSessions = bookings.filter(b => b.status === 'CONFIRMED').slice(0, 3);

  const toggleSlot = (day: string, hour: number) => {
      const key = `${day}-${hour}`;
      setBlockedSlots(prev => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return next;
      });
  };

  const handleCompleteSession = () => {
    if (selectedSession) {
        if(confirm("Are you sure you want to complete this session?")) {
            updateBookingStatus(selectedSession, BookingStatus.COMPLETED);
            setSelectedSession(null);
            alert("Session marked as completed.");
        }
    }
  };

  if (activeTab === 'home') {
      return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Coach's Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md p-6 rounded-3xl shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-500 dark:text-gray-400">Today's Sessions</h3>
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400"><Calendar className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">4</p>
            <p className="text-xs text-gray-500 mt-2">Next: 2:00 PM</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md p-6 rounded-3xl shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-500 dark:text-gray-400">Active Trainees</h3>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-500/20 rounded-lg text-green-600 dark:text-green-400"><User className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{MOCK_TRAINEES.length}</p>
            <p className="text-xs text-gray-500 mt-2">All active</p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md p-6 rounded-3xl shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-500 dark:text-gray-400">Hours This Week</h3>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400"><Clock className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">12</p>
            <p className="text-xs text-gray-500 mt-2">Target: 20</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">Upcoming Schedule</h3>
          <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-depth-light dark:shadow-depth-dark border border-gray-100 dark:border-white/10 p-6 space-y-4">
             {upcomingSessions.map((session, i) => {
                 const res = resources.find(r => r.id === session.resourceId);
                 return (
                     <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:shadow-md transition-all">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {session.startTime}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{res?.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{session.date} • {session.duration}h</p>
                            </div>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedSession(session.id);
                            navigateTo('sessions');
                          }}
                          className="px-4 py-2 bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-bold rounded-lg text-sm hover:text-indigo-600 dark:hover:text-white hover:border-indigo-200 dark:hover:border-white/20 transition-colors"
                        >
                          View Roster
                        </button>
                     </div>
                 )
             })}
             {upcomingSessions.length === 0 && <p className="text-gray-500 text-center py-4">No upcoming sessions.</p>}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'sessions') {
      return (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Session Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Session List */}
                  <div className="space-y-4">
                      {upcomingSessions.map(session => {
                          const res = resources.find(r => r.id === session.resourceId);
                          const isSelected = selectedSession === session.id;
                          return (
                              <div 
                                key={session.id} 
                                onClick={() => setSelectedSession(session.id)}
                                className={`p-6 rounded-3xl border transition-all cursor-pointer ${isSelected ? 'bg-indigo-600 text-white shadow-xl scale-[1.02] border-indigo-500' : 'bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                              >
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-bold text-lg">{res?.name}</h3>
                                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${isSelected ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>{session.startTime}:00</span>
                                  </div>
                                  <p className={`text-sm ${isSelected ? 'text-indigo-200' : 'text-gray-500'}`}>{session.date} • {session.duration} hrs</p>
                                  <div className="mt-4 flex items-center space-x-2">
                                      <User className="w-4 h-4" />
                                      <span className="text-sm font-bold">12 / 15 Registered</span>
                                  </div>
                              </div>
                          )
                      })}
                  </div>

                  {/* Roster / Details */}
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-depth-light dark:shadow-depth-dark border border-gray-100 dark:border-white/10 p-6 flex flex-col h-[600px]">
                      {selectedSession ? (
                          <>
                              <div className="border-b border-gray-200 dark:border-white/10 pb-4 mb-4">
                                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">Class Roster</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Mark attendance for selected session</p>
                              </div>
                              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                  {[1,2,3,4,5].map((_, i) => (
                                      <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/5">
                                          <div className="flex items-center space-x-3">
                                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                                              <span className="font-bold text-gray-800 dark:text-gray-200">Student Name {i+1}</span>
                                          </div>
                                          <div className="flex space-x-2">
                                              <button onClick={() => alert("Marked present")} className="p-2 text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40"><CheckCircle className="w-5 h-5"/></button>
                                              <button onClick={() => alert("Marked absent")} className="p-2 text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40"><XCircle className="w-5 h-5"/></button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <button 
                                onClick={handleCompleteSession}
                                className="w-full mt-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                              >
                                Complete Session
                              </button>
                          </>
                      ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                              <ClipboardList className="w-16 h-16 mb-4 opacity-20" />
                              <p>Select a session to manage roster</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )
  }
  
  // (Trainees tab same as before)
  if (activeTab === 'trainees') {
      return (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Trainees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_TRAINEES.map(trainee => (
                      <div key={trainee.id} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl p-6 shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10 relative overflow-hidden group">
                          {/* ... card content same ... */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full"></div>
                          <div className="flex items-center space-x-4 mb-6">
                              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <img src={`https://ui-avatars.com/api/?name=${trainee.name}&background=random`} alt={trainee.name} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{trainee.name}</h3>
                                  <span className={`text-xs px-2 py-1 rounded-full ${trainee.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50'} font-bold`}>{trainee.status}</span>
                              </div>
                          </div>
                          
                          <div className="space-y-3">
                              <div>
                                  <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">
                                      <span>Progress</span>
                                      <span>{trainee.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                      <div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${trainee.progress}%` }}></div>
                                  </div>
                              </div>
                              <button onClick={() => alert("Viewing trainee details...")} className="w-full py-2 mt-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                  View Details
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  if (activeTab === 'availability') {
      return (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
                  <button 
                    onClick={() => alert("Availability schedule saved!")}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-indigo-500"
                  >
                    Save Changes
                  </button>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-depth-light dark:shadow-depth-dark border border-gray-100 dark:border-white/10 p-8 overflow-x-auto">
                  <div className="grid grid-cols-8 gap-4 min-w-[800px]">
                      <div className="col-span-1"></div>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                          <div key={d} className="text-center font-bold text-gray-500 uppercase text-sm tracking-wider">{d}</div>
                      ))}

                      {[9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => (
                          <React.Fragment key={hour}>
                              <div className="text-right text-sm font-bold text-gray-500 pr-4 pt-3">{hour}:00</div>
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                  const key = `${day}-${hour}`;
                                  const isBlocked = blockedSlots.has(key);
                                  return (
                                  <div 
                                    key={key} 
                                    onClick={() => toggleSlot(day, hour)}
                                    className={`h-12 rounded-lg border cursor-pointer transition-all relative group flex items-center justify-center
                                        ${isBlocked 
                                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50' 
                                            : 'bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-white/5 hover:border-indigo-500'}`}
                                  >
                                      {isBlocked && (
                                          <div className="text-xs font-bold text-red-500">BUSY</div>
                                      )}
                                      {!isBlocked && <div className="hidden group-hover:block text-xs font-bold text-indigo-500">+</div>}
                                  </div>
                              )})}
                          </React.Fragment>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  return (
      <div>Error: Unknown Tab</div>
  )
};

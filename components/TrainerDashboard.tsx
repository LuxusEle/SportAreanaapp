
import React, { useState } from 'react';
import { MOCK_TRAINEES } from '../constants';
import { useApp } from '../services/store';
import { Calendar, Clock, User, CheckCircle, XCircle, MoreVertical, ClipboardList } from 'lucide-react';

interface TrainerDashboardProps {
  activeTab: string;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ activeTab }) => {
  const { bookings, resources, currentUser } = useApp();
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

  if (activeTab === 'home') {
      // (Same as before)
      return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">Coach's Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-glass-sm border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Today's Sessions</h3>
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Calendar className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900">4</p>
            <p className="text-xs text-gray-500 mt-2">Next: 2:00 PM</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-glass-sm border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Active Trainees</h3>
              <div className="p-2 bg-green-100 rounded-lg text-green-600"><User className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900">{MOCK_TRAINEES.length}</p>
            <p className="text-xs text-gray-500 mt-2">All active</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl shadow-glass-sm border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Hours This Week</h3>
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Clock className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-extrabold text-gray-900">12</p>
            <p className="text-xs text-gray-500 mt-2">Target: 20</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Schedule</h3>
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-glass border border-white/50 p-6 space-y-4">
             {upcomingSessions.map((session, i) => {
                 const res = resources.find(r => r.id === session.resourceId);
                 return (
                     <div key={i} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-white/60 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {session.startTime}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{res?.name}</h4>
                                <p className="text-sm text-gray-500">{session.date} • {session.duration}h</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50">View Roster</button>
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
      // (Same as before)
      return (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Session Management</h2>
              
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
                                className={`p-6 rounded-3xl border transition-all cursor-pointer ${isSelected ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white/70 backdrop-blur-md border-white/50 hover:bg-white'}`}
                              >
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-bold text-lg">{res?.name}</h3>
                                      <span className="px-2 py-1 rounded-md bg-white/20 text-xs font-bold">{session.startTime}:00</span>
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
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-glass border border-white/50 p-6 flex flex-col h-[600px]">
                      {selectedSession ? (
                          <>
                              <div className="border-b border-gray-100 pb-4 mb-4">
                                  <h3 className="font-bold text-xl text-gray-900">Class Roster</h3>
                                  <p className="text-sm text-gray-500">Mark attendance for selected session</p>
                              </div>
                              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                  {[1,2,3,4,5].map((_, i) => (
                                      <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                                          <div className="flex items-center space-x-3">
                                              <div className="w-10 h-10 rounded-full bg-gray-200" />
                                              <span className="font-bold text-gray-800">Student Name {i+1}</span>
                                          </div>
                                          <div className="flex space-x-2">
                                              <button className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"><CheckCircle className="w-5 h-5"/></button>
                                              <button className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><XCircle className="w-5 h-5"/></button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <button className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl font-bold">Complete Session</button>
                          </>
                      ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                              <ClipboardList className="w-16 h-16 mb-4 opacity-30" />
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
              <h2 className="text-2xl font-bold text-gray-900">My Trainees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_TRAINEES.map(trainee => (
                      <div key={trainee.id} className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-glass border border-white/50 relative overflow-hidden group">
                          {/* ... card content same ... */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full"></div>
                          <div className="flex items-center space-x-4 mb-6">
                              <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden">
                                  <img src={`https://ui-avatars.com/api/?name=${trainee.name}&background=random`} alt={trainee.name} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900">{trainee.name}</h3>
                                  <span className={`text-xs px-2 py-1 rounded-full ${trainee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} font-bold`}>{trainee.status}</span>
                              </div>
                          </div>
                          
                          <div className="space-y-3">
                              <div>
                                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-1">
                                      <span>Progress</span>
                                      <span>{trainee.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${trainee.progress}%` }}></div>
                                  </div>
                              </div>
                              <button className="w-full py-2 mt-4 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors">
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
                  <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-md">Save Changes</button>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-glass border border-white/50 p-8 overflow-x-auto">
                  <div className="grid grid-cols-8 gap-4 min-w-[800px]">
                      <div className="col-span-1"></div>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                          <div key={d} className="text-center font-bold text-gray-600 uppercase text-sm tracking-wider">{d}</div>
                      ))}

                      {[9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => (
                          <React.Fragment key={hour}>
                              <div className="text-right text-sm font-bold text-gray-400 pr-4 pt-3">{hour}:00</div>
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                  const key = `${day}-${hour}`;
                                  const isBlocked = blockedSlots.has(key);
                                  return (
                                  <div 
                                    key={key} 
                                    onClick={() => toggleSlot(day, hour)}
                                    className={`h-12 rounded-lg border cursor-pointer transition-all relative group flex items-center justify-center
                                        ${isBlocked 
                                            ? 'bg-red-50 border-red-200' 
                                            : 'bg-white border-gray-100 hover:border-indigo-500'}`}
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

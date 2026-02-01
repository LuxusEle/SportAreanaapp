
import React, { useState } from 'react';
import { MOCK_TRAINEES } from '../constants';
import { useApp } from '../services/store';
import { Calendar, Clock, User, CheckCircle, XCircle, MoreVertical, ClipboardList, ChevronLeft, X, Edit3, Save } from 'lucide-react';
import { BookingStatus } from '../types';

interface TrainerDashboardProps {
  activeTab: string;
  navigateTo: (tab: string) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ activeTab, navigateTo }) => {
  const { bookings, resources, currentUser, updateBookingStatus } = useApp();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [viewTraineeId, setViewTraineeId] = useState<string | null>(null);
  const [isEditingTrainee, setIsEditingTrainee] = useState(false);
  const [traineeNotes, setTraineeNotes] = useState('');
  
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
    if (selectedSession && confirm("Are you sure you want to complete this session?")) {
        updateBookingStatus(selectedSession, BookingStatus.COMPLETED);
        setSelectedSession(null);
        alert("Session marked as completed.");
        navigateTo('home');
    }
  };

  const getTraineeDetails = (id: string) => MOCK_TRAINEES.find(t => t.id === id);

  const saveTraineeDetails = () => {
      setIsEditingTrainee(false);
      alert("Trainee details updated!");
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
              <button onClick={() => navigateTo('home')} className="flex items-center text-gray-500 hover:text-indigo-600 font-bold"><ChevronLeft className="w-4 h-4 mr-1"/> Back to Home</button>
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
                                              <button className="p-2 text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/20 rounded-lg"><CheckCircle className="w-5 h-5"/></button>
                                              <button className="p-2 text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg"><XCircle className="w-5 h-5"/></button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <button onClick={handleCompleteSession} className="w-full mt-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold">Complete Session</button>
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
  
  if (activeTab === 'trainees') {
      const trainee = viewTraineeId ? getTraineeDetails(viewTraineeId) : null;

      return (
          <div className="space-y-6 relative">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Trainees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_TRAINEES.map(trainee => (
                      <div key={trainee.id} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl p-6 shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full"></div>
                          <div className="flex items-center space-x-4 mb-6">
                              <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <img src={`https://ui-avatars.com/api/?name=${trainee.name}&background=random`} alt={trainee.name} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{trainee.name}</h3>
                                  <span className={`text-xs px-2 py-1 rounded-full ${trainee.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} font-bold`}>{trainee.status}</span>
                              </div>
                          </div>
                          <button onClick={() => setViewTraineeId(trainee.id)} className="w-full py-2 mt-4 bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 rounded-xl font-bold text-sm text-indigo-600 dark:text-white hover:bg-indigo-100 dark:hover:bg-white/10 transition-colors">
                              Manage Profile
                          </button>
                      </div>
                  ))}
              </div>

              {/* Trainee Detail Modal with Edit Capability */}
              {trainee && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl" onClick={() => { setViewTraineeId(null); setIsEditingTrainee(false); }} />
                      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 border border-white/10">
                          <button onClick={() => { setViewTraineeId(null); setIsEditingTrainee(false); }} className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full"><X className="w-5 h-5"/></button>
                          
                          <div className="text-center mb-6">
                              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden border-4 border-indigo-500/20">
                                 <img src={`https://ui-avatars.com/api/?name=${trainee.name}&background=random`} className="w-full h-full" />
                              </div>
                              <h2 className="text-2xl font-bold dark:text-white">{trainee.name}</h2>
                              <p className="text-gray-500 dark:text-gray-400">Personal Training Plan</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-center">
                                  <p className="text-xs uppercase text-gray-500 font-bold">Sessions</p>
                                  <p className="text-xl font-bold dark:text-white">12</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-center">
                                  <p className="text-xs uppercase text-gray-500 font-bold">Progress</p>
                                  <p className="text-xl font-bold text-green-500">{trainee.progress}%</p>
                              </div>
                          </div>

                          <div className="mb-6">
                              <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-bold text-gray-500">Coach's Notes</label>
                                  <button onClick={() => setIsEditingTrainee(!isEditingTrainee)} className="text-xs text-indigo-500 font-bold flex items-center">
                                      {isEditingTrainee ? <Save className="w-3 h-3 mr-1"/> : <Edit3 className="w-3 h-3 mr-1"/>}
                                      {isEditingTrainee ? 'Save' : 'Edit'}
                                  </button>
                              </div>
                              {isEditingTrainee ? (
                                  <textarea 
                                    className="w-full bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500"
                                    rows={4}
                                    defaultValue="Athlete is showing great improvement in agility drills. Needs to focus on stamina."
                                    onChange={(e) => setTraineeNotes(e.target.value)}
                                  />
                              ) : (
                                  <div className="w-full bg-gray-50 dark:bg-white/5 border border-transparent rounded-xl p-3 text-sm text-gray-600 dark:text-gray-300 italic">
                                      "{traineeNotes || "Athlete is showing great improvement in agility drills. Needs to focus on stamina."}"
                                  </div>
                              )}
                          </div>

                          {isEditingTrainee && (
                              <button onClick={saveTraineeDetails} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold mb-3 shadow-lg">Save Changes</button>
                          )}
                          <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Message Trainee</button>
                      </div>
                  </div>
              )}
          </div>
      )
  }

  if (activeTab === 'availability') {
      return (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Availability</h2>
                  <button onClick={() => alert("Availability schedule saved!")} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-indigo-500">Save Changes</button>
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
                                    className={`h-12 rounded-lg border cursor-pointer transition-all relative flex items-center justify-center font-bold text-xs
                                        ${isBlocked 
                                            ? 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-400 opacity-50' 
                                            : 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 hover:scale-105'}`}
                                  >
                                      {isBlocked ? 'OFF' : 'OPEN'}
                                  </div>
                              )})}
                          </React.Fragment>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  return <div>Error: Unknown Tab</div>
};

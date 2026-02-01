
import React, { useState, useEffect } from 'react';
import { useApp } from './services/store';
import { UserRole } from './types';
import Layout from './components/Layout';
import { PlayerDashboard } from './components/PlayerDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TrainerDashboard } from './components/TrainerDashboard';
import { User, Shield, Briefcase, Dumbbell, Sun, Moon } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login, tenant, theme, toggleTheme } = useApp();

  // Apply dark mode class for Login Screen independent of Layout
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400 dark:bg-indigo-600 blur-[120px] opacity-20 dark:opacity-30"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300 dark:bg-blue-500 blur-[120px] opacity-20 dark:opacity-30"></div>
      </div>

      <div className="absolute top-6 right-6 z-20">
         <button onClick={toggleTheme} className="p-3 bg-white dark:bg-white/10 rounded-full shadow-lg text-gray-700 dark:text-white hover:scale-110 transition-transform">
            {theme === 'dark' ? <Sun className="w-6 h-6"/> : <Moon className="w-6 h-6"/>}
         </button>
      </div>

      <div className="z-10 w-full max-w-md bg-white/70 dark:bg-white/10 backdrop-blur-lg border border-white/40 dark:border-white/20 p-8 rounded-2xl shadow-deep-light dark:shadow-deep-dark">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/50">
             <span className="text-2xl font-bold text-white">OS</span>
           </div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tenant.name}</h1>
           <p className="text-gray-600 dark:text-gray-300">Venue Operating System</p>
        </div>

        <div className="space-y-4">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Select User Persona</p>
          
          <button 
            onClick={() => login(UserRole.PLAYER)}
            className="w-full bg-white group hover:bg-indigo-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between border border-gray-100 dark:border-transparent"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <User className="w-6 h-6 text-gray-600 group-hover:text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Player</p>
                <p className="text-xs text-gray-500">Book courts, view history</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-indigo-600">&rarr;</span>
          </button>

          <button 
            onClick={() => login(UserRole.STAFF)}
            className="w-full bg-white group hover:bg-green-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between border border-gray-100 dark:border-transparent"
          >
             <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                <Briefcase className="w-6 h-6 text-gray-600 group-hover:text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Staff</p>
                <p className="text-xs text-gray-500">POS, Check-in scanner</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-green-600">&rarr;</span>
          </button>

          <button 
            onClick={() => login(UserRole.TRAINER)}
            className="w-full bg-white group hover:bg-orange-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between border border-gray-100 dark:border-transparent"
          >
             <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-orange-100 transition-colors">
                <Dumbbell className="w-6 h-6 text-gray-600 group-hover:text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Trainer</p>
                <p className="text-xs text-gray-500">Sessions, Trainees</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-orange-600">&rarr;</span>
          </button>

          <button 
            onClick={() => login(UserRole.ADMIN)}
            className="w-full bg-white group hover:bg-purple-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between border border-gray-100 dark:border-transparent"
          >
             <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Shield className="w-6 h-6 text-gray-600 group-hover:text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">Analytics, settings</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-purple-600">&rarr;</span>
          </button>
        </div>
        
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-xs">
          <p>Powered by ArenaOS &copy; 2024</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Set default tab based on role when user logs in
  useEffect(() => {
    if (currentUser?.role === UserRole.PLAYER) {
      setActiveTab('explore');
    } else if (currentUser?.role === UserRole.TRAINER) {
      setActiveTab('home');
    } else {
      setActiveTab('dashboard');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (currentUser.role) {
      case UserRole.ADMIN:
        return <AdminDashboard activeTab={activeTab} />;
      
      case UserRole.STAFF:
        return <StaffDashboard activeTab={activeTab} />;
      
      case UserRole.TRAINER:
        return <TrainerDashboard activeTab={activeTab} navigateTo={setActiveTab} />;

      case UserRole.PLAYER:
        if (activeTab === 'profile') return <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm"><h2 className="text-xl font-bold dark:text-white">Profile</h2><p className="text-gray-500 dark:text-gray-400">User profile settings would go here.</p></div>;
        return <PlayerDashboard activeTab={activeTab} navigateTo={setActiveTab} />;
      
      default:
        return <div>Unknown Role</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;

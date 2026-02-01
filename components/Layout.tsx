
import React from 'react';
import { useApp } from '../services/store';
import { 
  LogOut, 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Users, 
  Activity, 
  QrCode,
  Menu,
  X,
  CreditCard,
  Package,
  Dumbbell,
  ShieldCheck,
  FileText,
  ClipboardList,
  Clock,
  DollarSign
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, tenant } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Helper for active button styling
  const activeBtn = (color: string = 'indigo') => {
    const map: Record<string, string> = {
      emerald: "bg-emerald-600 ring-emerald-300/30",
      orange: "bg-orange-600 ring-orange-300/30",
      red: "bg-red-600 ring-red-300/30",
      violet: "bg-violet-600 ring-violet-300/30",
      blue: "bg-blue-600 ring-blue-300/30",
      indigo: "bg-indigo-600 ring-indigo-300/30",
      slate: "bg-slate-700 ring-white/10",
    };

    const style = map[color] || map['indigo'];

    // Warm glow shadow as requested for "dark mode" aesthetic
    const glow = "shadow-[0_10px_22px_rgba(0,0,0,0.4),0_0_26px_rgba(255,214,102,0.28),0_0_10px_rgba(255,244,230,0.18)]";

    return `transform -translate-y-1 text-white ring-1 ${style} ${glow}`;
  };

  const getNavItems = () => {
    switch (currentUser?.role) {
      case UserRole.ADMIN:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'violet' },
          { id: 'resources', label: 'Resources', icon: Dumbbell, color: 'emerald' },
          { id: 'customers', label: 'Customers', icon: Users, color: 'orange' },
          { id: 'pricing', label: 'Pricing', icon: DollarSign, color: 'blue' },
          { id: 'policies', label: 'Policies', icon: ShieldCheck, color: 'red' },
          { id: 'reports', label: 'Reports', icon: FileText, color: 'violet' },
          { id: 'integrations', label: 'Integrations', icon: Settings, color: 'slate' },
        ];
      case UserRole.STAFF:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'violet' },
          { id: 'walkin', label: 'New Walk-in', icon: Users, color: 'orange' },
          { id: 'checkin', label: 'Check-in', icon: QrCode, color: 'emerald' },
          { id: 'bookings', label: 'Bookings', icon: Calendar, color: 'blue' },
          { id: 'payments', label: 'Payments', icon: CreditCard, color: 'red' },
        ];
      case UserRole.TRAINER:
        return [
          { id: 'home', label: 'Home', icon: LayoutDashboard, color: 'violet' },
          { id: 'sessions', label: 'Sessions', icon: ClipboardList, color: 'blue' },
          { id: 'trainees', label: 'Trainees', icon: Users, color: 'orange' },
          { id: 'availability', label: 'Availability', icon: Clock, color: 'emerald' },
        ];
      case UserRole.PLAYER:
      default:
        return [
          { id: 'explore', label: 'Book Now', icon: LayoutDashboard, color: 'violet' },
          { id: 'my-bookings', label: 'My Bookings', icon: Calendar, color: 'blue' },
          { id: 'packages', label: 'Packages', icon: Package, color: 'orange' },
          { id: 'payments', label: 'Payments', icon: CreditCard, color: 'red' },
          { id: 'profile', label: 'Profile', icon: Users, color: 'emerald' },
        ];
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col md:flex-row">
      {/* 
          DYNAMIC BACKGROUND
          This is the key visual element controlled by the Admin Settings 
      */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${tenant.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-sm" />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden glass-panel border-b border-white/20 p-4 flex justify-between items-center sticky top-0 z-20 relative m-4 rounded-xl">
        <div className="flex items-center space-x-2">
           <img src={tenant.logo} alt="Logo" className="w-8 h-8 rounded bg-white/50 p-1" />
           <span className="font-bold text-gray-900">{tenant.name}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* GLASS SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 p-6 transform transition-transform duration-300 ease-out
        md:relative md:translate-x-0 md:flex md:flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Container with Glass effect */}
        <div className="h-full glass-panel rounded-3xl flex flex-col shadow-glass overflow-hidden relative">
          
          {/* Logo Section */}
          <div className="p-8 flex flex-col items-center border-b border-white/30">
            <div className="w-20 h-20 rounded-2xl bg-white/40 p-2 shadow-inner mb-4 flex items-center justify-center">
              <img src={tenant.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-bold text-xl leading-tight text-center text-gray-800 tracking-tight">{tenant.name}</h1>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-full mt-2 uppercase tracking-widest">
              {currentUser?.role}
            </span>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-2 p-4 overflow-y-auto no-scrollbar">
            {getNavItems().map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden text-left
                    ${isActive 
                      ? activeBtn(item.color)
                      : 'hover:bg-white/40 text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'group-hover:scale-110'}`} />
                  <span className={`relative z-10 font-semibold ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-white/30 bg-white/20">
            <div className="flex items-center space-x-3 mb-4 px-2 p-2 rounded-xl bg-white/30 backdrop-blur-sm">
              <img src={currentUser?.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-gray-800">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 truncate font-medium">{currentUser?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50/80 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-[calc(100vh)] md:h-screen p-4 md:p-6 overflow-hidden">
        {/* Content Container - The "Paper" floating on the background */}
        <div className="h-full w-full glass-panel rounded-3xl shadow-2xl overflow-y-auto relative no-scrollbar flex flex-col">
          {/* Header area inside content for context */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-6 border-b border-white/40 flex justify-between items-center">
             <div>
               <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight capitalize">
                 {activeTab.replace('-', ' ')}
               </h2>
               <p className="text-sm text-gray-500 font-medium">Welcome back, {currentUser?.name.split(' ')[0]}</p>
             </div>
             
             {/* Dynamic Date/Status Widget */}
             <div className="hidden md:flex items-center space-x-4">
                <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">System Online</span>
                </div>
                <div className="px-4 py-2 bg-indigo-500 text-white rounded-xl shadow-neon shadow-indigo-500/30 flex items-center space-x-2 font-bold text-sm">
                   <Calendar className="w-4 h-4" />
                   <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
             </div>
          </div>

          <div className="p-6 md:p-10 flex-1">
            {children}
          </div>
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

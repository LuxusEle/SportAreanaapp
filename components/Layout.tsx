
import React, { useEffect, useState } from 'react';
import { useApp } from '../services/store';
import { 
  LogOut, 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Users, 
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
  DollarSign,
  Sun,
  Moon,
  Zap,
  Activity,
  Globe,
  Database,
  PlayCircle
} from 'lucide-react';
import { UserRole, BookingStatus } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Curated high-quality sports images for the background carousel
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2564&auto=format&fit=crop', // Basketball
  'https://images.unsplash.com/photo-1579952363873-27f3bde9be2b?q=80&w=2564&auto=format&fit=crop', // Soccer
  'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?q=80&w=2564&auto=format&fit=crop', // Swimming
  'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2564&auto=format&fit=crop', // Tennis
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2564&auto=format&fit=crop', // Crossfit
];

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, tenant, theme, toggleTheme, resources, bookings, isSupabaseConnected } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Stats for Marquee
  const activeArenas = resources.length;
  const today = new Date().toISOString().split('T')[0];
  const gamesInEffect = bookings.filter(b => b.date === today && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CHECKED_IN)).length;
  // Simulating online users based on base + active transactions/bookings for hype
  const sportsmenOnline = Math.floor(Math.random() * 5) + 120 + gamesInEffect * 2; 

  // Apply dark mode class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Carousel Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 8000); // Change image every 8 seconds for "slow" effect
    return () => clearInterval(interval);
  }, []);

  // Helper for active button styling with Colored Underglow
  const activeBtn = (color: string = 'indigo') => {
    const map: Record<string, { bg: string, ring: string, glow: string }> = {
      emerald: { bg: "bg-emerald-600", ring: "ring-emerald-300/30", glow: "glow-emerald" },
      orange:  { bg: "bg-orange-600",  ring: "ring-orange-300/30",  glow: "glow-orange" },
      red:     { bg: "bg-red-600",     ring: "ring-red-300/30",     glow: "glow-red" },
      violet:  { bg: "bg-violet-600",  ring: "ring-violet-300/30",  glow: "glow-violet" },
      blue:    { bg: "bg-blue-600",    ring: "ring-blue-300/30",    glow: "glow-blue" },
      indigo:  { bg: "bg-indigo-600",  ring: "ring-indigo-300/30",  glow: "glow-indigo" },
      slate:   { bg: "bg-slate-700",   ring: "ring-white/10",       glow: "glow-slate" },
      gray:    { bg: "bg-gray-600",    ring: "ring-white/10",       glow: "glow-slate" }, 
    };

    const style = map[color] || map['indigo'];
    return `transform -translate-y-1.5 text-white ring-1 ${style.ring} ${style.bg} ${style.glow}`;
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

  const MarqueeContent = () => (
    <>
      <div className="flex items-center mx-8">
        <Activity className="w-4 h-4 text-indigo-400 mr-3" />
        <span className="tracking-wide text-gray-200 uppercase text-xs font-bold">Live system status</span>
      </div>
      
      <div className="flex items-center mx-8">
        <Globe className="w-4 h-4 text-emerald-400 mr-3" />
        <span className="tracking-wide text-gray-200 text-sm">
           <span className="font-extrabold text-white text-lg mr-2">{activeArenas}</span> 
           Active arenas
        </span>
      </div>

      <div className="flex items-center mx-8">
        <Users className="w-4 h-4 text-blue-400 mr-3" />
        <span className="tracking-wide text-gray-200 text-sm">
           <span className="font-extrabold text-white text-lg mr-2">{sportsmenOnline}</span> 
           Athletes online
        </span>
      </div>

      <div className="flex items-center mx-8">
        <PlayCircle className="w-4 h-4 text-rose-400 mr-3" />
        <span className="tracking-wide text-gray-200 text-sm">
           <span className="font-extrabold text-white text-lg mr-2">{gamesInEffect}</span> 
           Live games
        </span>
      </div>

      <div className="flex items-center mx-8">
        <Database className={`w-4 h-4 mr-3 ${isSupabaseConnected ? 'text-green-400' : 'text-red-400'}`} />
        <span className="tracking-wide text-gray-200 text-sm">
           Database sync: <span className={`font-bold ml-2 ${isSupabaseConnected ? 'text-green-400' : 'text-red-400'}`}>{isSupabaseConnected ? 'Online' : 'Offline'}</span>
        </span>
      </div>
    </>
  );

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col md:flex-row bg-gray-200 dark:bg-black transition-colors duration-500">
      
      {/* --- BACKGROUND CAROUSEL --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {BACKGROUND_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out ${index === currentBgIndex ? 'opacity-100 animate-ken-burns' : 'opacity-0'}`}
            style={{ 
              backgroundImage: `url(${img})`,
            }}
          />
        ))}
        {/* Posh Dotted Overlay & Blur */}
        <div className="absolute inset-0 bg-dots opacity-40" />
        <div className="absolute inset-0 bg-white/70 dark:bg-black/80 backdrop-blur-[2px] transition-colors duration-500" />
      </div>

      {/* --- TIGER MARQUEE --- */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-indigo-950/90 backdrop-blur-md text-white py-2 overflow-hidden border-b border-white/5 shadow-2xl">
         <div className="flex w-full whitespace-nowrap animate-marquee items-center">
            <div className="flex items-center">
               <MarqueeContent />
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex items-center">
               <MarqueeContent />
            </div>
            <div className="flex items-center">
               <MarqueeContent />
            </div>
         </div>
      </div>

      {/* Mobile Header (Pushed down slightly by marquee) */}
      <div className="md:hidden flex-none glass-panel border-b border-gray-200 dark:border-white/10 p-4 flex justify-between items-center z-20 relative m-4 mt-12 rounded-xl shadow-depth-light dark:shadow-depth-dark">
        <div className="flex items-center space-x-4">
           {/* Mobile Menu Button - Left Aligned */}
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-900 dark:text-white">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
           
           <div className="flex items-center space-x-2">
              <img src={tenant.logo} alt="Logo" className="w-8 h-8 rounded bg-gray-100 dark:bg-white/10 p-1" />
              <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{tenant.name}</span>
           </div>
        </div>
        
        {/* Theme Toggle - Right Aligned */}
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
        </button>
      </div>

      {/* GLASS SIDEBAR (Adjusted mt for marquee) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 p-6 pt-14 transform transition-transform duration-300 ease-out
        md:relative md:translate-x-0 md:flex md:flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full glass-panel rounded-3xl flex flex-col shadow-depth-light dark:shadow-depth-dark overflow-hidden relative transition-all duration-300">
          
          <div className="p-8 flex flex-col items-center border-b border-gray-200 dark:border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-white/50 dark:bg-white/5 p-2 shadow-inner mb-4 flex items-center justify-center border border-white/20 dark:border-white/10">
              <img src={tenant.logo} alt="Logo" className="w-full h-full object-contain opacity-90" />
            </div>
            <h1 className="font-bold text-xl leading-tight text-center text-gray-900 dark:text-white tracking-tight">{tenant.name}</h1>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1 rounded-full mt-2 uppercase tracking-widest">
              {currentUser?.role}
            </span>
          </div>

          <nav className="flex-1 space-y-3 p-4 overflow-y-auto no-scrollbar">
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
                      : 'hover:bg-white/60 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:pl-6 hover:shadow-md'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} />
                  <span className={`relative z-10 font-semibold transition-colors ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <div className="hidden md:flex justify-end mb-4 px-2">
                 <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10 shadow-sm"
                    title="Toggle Theme"
                 >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 </button>
            </div>

            <div className="flex items-center space-x-3 mb-4 px-2 p-2 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/5">
              <img src={currentUser?.avatar} className="w-10 h-10 rounded-full border border-white/40 dark:border-white/20 shadow-sm" alt="User" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-200">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 truncate font-medium">{currentUser?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 md:pt-14 relative z-10 mt-6 md:mt-0">
        
        {/* Content Container - Fixed Height Scrollable Area */}
        <div className="h-full w-full glass-panel rounded-3xl shadow-depth-light dark:shadow-depth-dark overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300">
          
          {/* Header area inside content for context */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center transition-colors duration-300 shadow-sm">
             <div>
               <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight capitalize">
                 {activeTab.replace('-', ' ')}
               </h2>
               <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Welcome back, {currentUser?.name.split(' ')[0]}</p>
             </div>
             
             <div className="hidden md:flex items-center space-x-4">
                <div className={`px-4 py-2 bg-white dark:bg-gray-800/80 rounded-xl shadow-card-light dark:shadow-card-dark border border-gray-100 dark:border-white/5 flex items-center space-x-2 ${!isSupabaseConnected ? 'border-red-500/50' : ''}`}>
                   <div className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                   <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{isSupabaseConnected ? 'System Online' : 'Mock Mode'}</span>
                </div>
                <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-glow-indigo flex items-center space-x-2 font-bold text-sm">
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

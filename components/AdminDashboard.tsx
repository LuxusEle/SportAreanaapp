
import React, { useState } from 'react';
import { useApp } from '../services/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Image as ImageIcon, Save, RefreshCw, Dumbbell, Plus, X, Tag, FileText, Settings, ShieldCheck, CreditCard } from 'lucide-react';
import { Resource, ResourceMode, UserRole, RateCard } from '../types';
import { MOCK_USERS } from '../constants';

interface AdminDashboardProps {
    activeTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab = 'dashboard' }) => {
  const { resources, bookings, tenant, updateTenantBranding, addResource, rateCards, policies, updatePolicy, updateIntegration } = useApp();
  
  // Settings State
  const [bgImageInput, setBgImageInput] = useState(tenant.backgroundImage);
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor);

  // Resources State
  const [resourceList, setResourceList] = useState<Resource[]>(resources);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [newResourceName, setNewResourceName] = useState('');

  // Policy State
  const [localPolicy, setLocalPolicy] = useState(policies);
  
  // Integration State
  const [apiKey, setApiKey] = useState(tenant.qrApiConfig?.apiKey || '');
  const [webhookUrl, setWebhookUrl] = useState(tenant.qrApiConfig?.webhookUrl || '');

  // Mock Data
  const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const revenueData = [
    { name: 'Mon', amt: 400 },
    { name: 'Tue', amt: 300 },
    { name: 'Wed', amt: 550 },
    { name: 'Thu', amt: 450 },
    { name: 'Fri', amt: 800 },
    { name: 'Sat', amt: 1200 },
    { name: 'Sun', amt: 900 },
  ];
  
  const utilizationData = [
      { name: 'Basketball', value: 40 },
      { name: 'Swimming', value: 30 },
      { name: 'Futsal', value: 20 },
      { name: 'Cricket', value: 10 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleSaveSettings = () => {
    updateTenantBranding({ backgroundImage: bgImageInput, primaryColor });
    alert("Branding updated!");
  };

  const handleAddResource = () => {
    const res: Resource = {
      id: `res_${Date.now()}`,
      tenantId: tenant.id,
      name: newResourceName,
      type: 'Sport',
      mode: ResourceMode.EXCLUSIVE,
      capacity: 1,
      hourlyRate: 50,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800'
    };
    addResource(res);
    setResourceList(prev => [...prev, res]); 
    setIsAddResourceOpen(false);
    setNewResourceName('');
  };

  const handleSavePolicy = () => {
      updatePolicy(localPolicy);
      alert('Policies updated!');
  };

  const handleSaveIntegration = () => {
      updateIntegration({ apiKey, webhookUrl });
      alert('Integration config saved!');
  };

  // --- RESOURCES TAB ---
  if (activeTab === 'resources') {
      return (
          <div className="space-y-6 relative">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Resource Management</h2>
                  <button onClick={() => setIsAddResourceOpen(true)} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700">
                      <Plus className="w-4 h-4" />
                      <span>Add Resource</span>
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map(res => (
                      <div key={res.id} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-glass border border-white/50 relative group">
                          <div className="h-40 rounded-2xl bg-cover bg-center mb-4 relative overflow-hidden" style={{ backgroundImage: `url(${res.image})` }}>
                              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded font-bold">{res.type}</div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{res.name}</h3>
                          <p className="text-sm text-gray-500 mb-4 capitalize">{res.mode.toLowerCase()} Access • Capacity: {res.capacity}</p>
                          <div className="flex justify-between items-center">
                              <span className="font-extrabold text-indigo-600 text-lg">${res.hourlyRate}<span className="text-xs text-gray-400 font-normal">/hr (Base)</span></span>
                              <button onClick={() => alert("Edit resource feature coming soon.")} className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">Edit</button>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Add Resource Modal Overlay */}
              {isAddResourceOpen && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl">
                      <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">
                          <h3 className="text-xl font-bold mb-4">New Resource</h3>
                          <input 
                              className="w-full p-3 border rounded-xl mb-4" 
                              placeholder="Resource Name"
                              value={newResourceName}
                              onChange={e => setNewResourceName(e.target.value)} 
                          />
                          <div className="flex justify-end space-x-2">
                              <button onClick={() => setIsAddResourceOpen(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                              <button onClick={handleAddResource} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save</button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )
  }

  // --- PRICING TAB ---
  if (activeTab === 'pricing') {
      return (
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Rate Cards</h2>
                  <button onClick={() => alert("Create Rate Card modal coming soon.")} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">New Rate Card</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rateCards.map(rc => (
                      <div key={rc.id} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-glass border border-white/50">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900">{rc.name}</h3>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase tracking-wider">{rc.resourceType}</span>
                              </div>
                              <Tag className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Base Rate</span>
                                  <span className="font-bold text-gray-900">${rc.baseRate}/hr</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Peak Rate</span>
                                  <span className="font-bold text-indigo-600">${rc.peakRate}/hr</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Peak Hours</span>
                                  <span className="font-mono text-gray-600">{rc.peakHours.join(', ')}:00</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  // --- POLICIES TAB ---
  if (activeTab === 'policies') {
      return (
          <div className="space-y-6 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Operational Policies</h2>
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-glass border border-white/50 p-8 space-y-6">
                  <div>
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-indigo-600"/> Cancellations</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Cancel Window (Hrs)</label>
                              <input type="number" value={localPolicy.cancelWindowHrs} onChange={e => setLocalPolicy({...localPolicy, cancelWindowHrs: Number(e.target.value)})} className="w-full p-2 border rounded-xl mt-1" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">Refund %</label>
                              <input type="number" value={localPolicy.refundPercentage} onChange={e => setLocalPolicy({...localPolicy, refundPercentage: Number(e.target.value)})} className="w-full p-2 border rounded-xl mt-1" />
                          </div>
                      </div>
                  </div>

                  <div className="border-t pt-6">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Settings className="w-5 h-5 mr-2 text-indigo-600"/> Operations</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">GPS Radius (Meters)</label>
                              <input type="number" value={localPolicy.gpsRadiusMeters} onChange={e => setLocalPolicy({...localPolicy, gpsRadiusMeters: Number(e.target.value)})} className="w-full p-2 border rounded-xl mt-1" />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase">No-Show Penalty ($)</label>
                              <input type="number" value={localPolicy.noShowPenalty} onChange={e => setLocalPolicy({...localPolicy, noShowPenalty: Number(e.target.value)})} className="w-full p-2 border rounded-xl mt-1" />
                          </div>
                      </div>
                  </div>

                  <button onClick={handleSavePolicy} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Save Changes</button>
              </div>
          </div>
      )
  }

  // --- INTEGRATIONS TAB ---
  if (activeTab === 'integrations') {
      return (
          <div className="space-y-6 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-glass border border-white/50 p-8 space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600">
                          <CreditCard className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">QR Payment Gateway</h3>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">API Key</label>
                          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full p-3 border rounded-xl mt-1 font-mono" />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">Webhook URL</label>
                          <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="w-full p-3 border rounded-xl mt-1 font-mono" />
                      </div>
                  </div>
                  
                  <button onClick={handleSaveIntegration} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800">Update Configuration</button>
              </div>
          </div>
      )
  }

  // --- REPORTS TAB ---
  if (activeTab === 'reports') {
      return (
          <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">Performance Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-glass border border-white/50 p-6 h-80">
                      <h3 className="font-bold text-gray-800 mb-4">Revenue Trend</h3>
                      <ResponsiveContainer width="100%" height="90%">
                          <AreaChart data={revenueData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Area type="monotone" dataKey="amt" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>

                  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-glass border border-white/50 p-6 h-80">
                      <h3 className="font-bold text-gray-800 mb-4">Resource Utilization</h3>
                      <ResponsiveContainer width="100%" height="90%">
                          <PieChart>
                              <Pie data={utilizationData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  {utilizationData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )
  }

  // --- CUSTOMERS TAB ---
  if (activeTab === 'customers') {
      return (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Customer Database</h2>
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-glass border border-white/50 overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
                          <tr>
                              <th className="px-6 py-4">User</th>
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4">Credits</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {MOCK_USERS.filter(u => u.role === UserRole.PLAYER).map(user => (
                              <tr key={user.id} className="hover:bg-white/50">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                              <img src={user.avatar} className="w-full h-full object-cover" />
                                          </div>
                                          <span className="font-bold text-gray-900">{user.name}</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4"><span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">{user.role}</span></td>
                                  <td className="px-6 py-4 font-mono">{user.credits || 0}</td>
                                  <td className="px-6 py-4"><span className="text-green-500 font-bold text-xs">● Active</span></td>
                                  <td className="px-6 py-4"><button onClick={() => alert("Customer History feature coming soon")} className="text-gray-400 hover:text-indigo-600 font-bold text-xs">View History</button></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )
  }

  // --- DASHBOARD (Default) ---
  return (
    <div className="space-y-10">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { title: 'Total Revenue', value: `$${totalRevenue + 4500}`, icon: DollarSign, color: 'from-green-500 to-emerald-700', trend: '+12.5%' },
          { title: 'Active Bookings', value: bookings.length.toString(), icon: Calendar, color: 'from-blue-500 to-indigo-700', trend: '+5%' },
          { title: 'Total Members', value: '1,240', icon: Users, color: 'from-purple-500 to-fuchsia-700', trend: '+18%' },
          { title: 'Utilization', value: '78%', icon: Activity, color: 'from-orange-500 to-red-700', trend: '-2%' },
        ].map((stat, idx) => (
          <div key={idx} className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
            <div className="relative bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-glass-sm border border-white/50 h-full flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                   <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{stat.value}</h3>
                 </div>
                 <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                   <stat.icon className="w-6 h-6" />
                 </div>
               </div>
               <div className="flex items-center text-sm font-bold">
                 <span className={`${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                   <TrendingUp className={`w-4 h-4 mr-1 ${stat.trend.startsWith('-') ? 'rotate-180' : ''}`} />
                   {stat.trend}
                 </span>
                 <span className="text-gray-400 ml-2">vs last week</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-glass border border-white/50">
            <h3 className="font-bold text-xl mb-6 text-gray-900 flex items-center">
              Revenue Analytics
              <span className="ml-auto text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">This Year</span>
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 600}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(val) => `$${val}`}/>
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', background: 'rgba(255,255,255,0.95)'}}
                    itemStyle={{color: '#4f46e5', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="amt" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Branding Settings Section */}
        <div className="relative">
           <div className="absolute inset-0 bg-pink-500/10 rounded-3xl blur-xl" />
           <div className="relative bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-glass border border-white/50 h-full">
             <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-gray-900">Venue Branding</h3>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Background Image URL</label>
                 <input 
                   type="text" 
                   value={bgImageInput} 
                   onChange={(e) => setBgImageInput(e.target.value)}
                   className="w-full p-4 rounded-xl bg-white border-2 border-transparent focus:border-indigo-500 focus:ring-0 shadow-inner text-sm transition-all text-gray-600"
                 />
               </div>
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Primary Color</label>
                   <div className="flex items-center space-x-2">
                       <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-10 rounded border" />
                       <span className="text-sm font-mono text-gray-500">{primaryColor}</span>
                   </div>
               </div>
               
               <button onClick={handleSaveSettings} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center space-x-2">
                 <Save className="w-5 h-5" />
                 <span>Save Branding</span>
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
import { Calendar } from 'lucide-react';

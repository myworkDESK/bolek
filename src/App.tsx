/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import PasscodeScreen from './components/PasscodeScreen';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  MessageSquare, 
  Search, 
  Bell, 
  Settings, 
  MoreHorizontal,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { Task, Stat } from './types';

const COLORS = ['#8884d8', '#ffc658', '#ff8042', '#00C49F'];

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Design System Update', project: 'DashOn UI', dueDate: '03.03.2026', priority: 'High', status: 'Done' },
  { id: '2', title: 'API Integration', project: 'Backend Sync', dueDate: '04.03.2026', priority: 'Medium', status: 'In Progress' },
  { id: '3', title: 'User Testing', project: 'Mobile App', dueDate: '05.03.2026', priority: 'Low', status: 'Canceled' },
  { id: '4', title: 'Marketing Assets', project: 'Campaign Q1', dueDate: '06.03.2026', priority: 'Medium', status: 'To Do' },
];

const STATS: Stat[] = [
  { label: 'TOTAL TASKS', value: '2056', trend: 11.5, color: '#8884d8' },
  { label: 'COMPLETED', value: '7456', trend: -11.5, color: '#ff8042' },
  { label: 'ACTIVE USERS', value: '4657', trend: 11.5, color: '#8884d8' },
  { label: 'EFFICIENCY', value: '4765', trend: 11.5, color: '#8884d8' },
];

const REVENUE_DATA = [
  { name: 'MAR', income: 8000, loss: 12000 },
  { name: 'APR', income: 10000, loss: 13000 },
  { name: 'MAY', income: 14000, loss: 17000 },
  { name: 'JUN', income: 12000, loss: 19000 },
  { name: 'JUL', income: 10000, loss: 15000 },
  { name: 'AUG', income: 11000, loss: 16000 },
  { name: 'SEP', income: 7000, loss: 13000 },
  { name: 'OCT', income: 12000, loss: 17000 },
];

const STATUS_DATA = [
  { name: 'Done', value: 50 },
  { name: 'In Progress', value: 25 },
  { name: 'Canceled', value: 25 },
];

type AuthState = 'login' | 'passcode_setup' | 'passcode_verify' | 'authenticated';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Restore session on mount (simple localStorage check)
  useEffect(() => {
    const session = localStorage.getItem('bolek_session');
    if (session === 'authenticated') {
      setAuthState('authenticated');
    }
  }, []);

  const handleLoginSuccess = (email: string, _method: 'email' | 'google') => {
    setUserEmail(email);
    const hasPasscode = localStorage.getItem(`bolek_passcode_set_${email}`) === '1';
    setAuthState(hasPasscode ? 'passcode_verify' : 'passcode_setup');
  };

  const handlePasscodeSuccess = () => {
    localStorage.setItem('bolek_session', 'authenticated');
    setAuthState('authenticated');
  };

  const handleBack = () => {
    setAuthState('login');
    setUserEmail('');
  };

  if (authState === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (authState === 'passcode_setup') {
    return (
      <PasscodeScreen
        email={userEmail}
        mode="setup"
        onSuccess={handlePasscodeSuccess}
        onBack={handleBack}
      />
    );
  }

  if (authState === 'passcode_verify') {
    return (
      <PasscodeScreen
        email={userEmail}
        mode="verify"
        onSuccess={handlePasscodeSuccess}
        onBack={handleBack}
      />
    );
  }

  // ── Dashboard (authenticated) ─────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden p-6">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl neumorphic flex items-center justify-center">
            <div className="w-5 h-5 bg-white/20 rounded-full blur-sm" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">DashOn</h1>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Projects', icon: Package },
            { name: 'Team', icon: Users },
            { name: 'Messages', icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-300 text-sm",
                activeTab === item.name 
                  ? "neumorphic-inset text-indigo-600 font-semibold" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-8 overflow-y-auto px-8">
        {/* Top Bar */}
        <header className="flex items-center justify-between">
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Search tasks, projects..." 
              className="w-full py-2 px-5 pr-10 rounded-2xl neumorphic-inset bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-400"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl neumorphic text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={18} />
            </button>
            <button className="p-2 rounded-xl neumorphic text-slate-400 hover:text-indigo-600 transition-colors">
              <Settings size={18} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">Emma Kwan</p>
                <p className="text-[10px] text-slate-400">Admin</p>
              </div>
              <img 
                src="https://picsum.photos/seed/emma/100/100" 
                alt="Profile" 
                className="w-10 h-10 rounded-xl neumorphic object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Analytics Overview */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">Analytics Overview</h2>
          <div className="grid grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="p-5 rounded-3xl neumorphic bg-white flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider">{stat.label}</span>
                  <div className={cn(
                    "flex items-center gap-1 text-[9px] font-bold",
                    stat.trend > 0 ? "text-indigo-500" : "text-orange-500"
                  )}>
                    <TrendingUp size={9} className={stat.trend < 0 ? "rotate-180" : ""} />
                    {Math.abs(stat.trend)}%
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                  <div className="w-16 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{v: 40}, {v: 70}, {v: 50}, {v: 90}, {v: 60}]}>
                        <Bar dataKey="v" fill={stat.color} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <div className="grid grid-cols-3 gap-8">
          {/* Productivity Chart */}
          <div className="col-span-2 p-6 rounded-[32px] neumorphic bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800">Task Productivity</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] text-slate-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-[10px] text-slate-400">Pending</span>
                </div>
                <button className="p-2 rounded-lg neumorphic text-slate-400">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="loss" fill="#ffc658" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="income" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Status */}
          <div className="p-6 rounded-[32px] neumorphic bg-white flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800">Task Status</h3>
              <button className="p-2 rounded-lg neumorphic text-slate-400">
                <MoreHorizontal size={14} />
              </button>
            </div>
            <div className="flex-1 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={STATUS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-xl font-bold text-slate-800">75%</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Done</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {STATUS_DATA.map((item, i) => (
                <div key={i} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-bold text-slate-800">{item.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{item.value}% over</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-8 pb-8">
          {/* Project Progress */}
          <div className="p-6 rounded-[32px] neumorphic bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800">Project Progress</h3>
              <button className="p-2 rounded-lg neumorphic text-slate-400">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {[
                { name: 'Mobile App', value: 84, color: '#818cf8' },
                { name: 'Web Dashboard', value: 25, color: '#818cf8' },
                { name: 'Backend API', value: 62, color: '#818cf8' },
              ].map((project, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">{project.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{project.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden neumorphic-inset">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${project.value}%`, backgroundColor: project.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="col-span-2 p-6 rounded-[32px] neumorphic bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800">Recent Tasks</h3>
              <button className="p-2 rounded-lg neumorphic text-slate-400">
                <MoreHorizontal size={14} />
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Task ID</th>
                  <th className="pb-3">Task Name</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {INITIAL_TASKS.map((task) => (
                  <tr key={task.id} className="group border-t border-slate-50">
                    <td className="py-3 font-bold text-slate-800">#{task.id.padStart(8, '0')}</td>
                    <td className="py-3 text-slate-500">{task.title}</td>
                    <td className="py-3 text-slate-500">{task.project}</td>
                    <td className="py-3 text-slate-500">{task.dueDate}</td>
                    <td className="py-3">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[9px] font-bold",
                        task.priority === 'High' ? "bg-red-50 text-red-500" :
                        task.priority === 'Medium' ? "bg-orange-50 text-orange-500" :
                        "bg-blue-50 text-blue-500"
                      )}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold text-white",
                        task.status === 'Done' ? "bg-indigo-500" :
                        task.status === 'In Progress' ? "bg-orange-400" :
                        task.status === 'Canceled' ? "bg-red-400" :
                        "bg-slate-400"
                      )}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

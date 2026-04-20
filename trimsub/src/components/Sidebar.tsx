'use client';

import { LayoutDashboard, CreditCard, Bell, Settings, Minus, ArrowRightLeft } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: true },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-card-border glass-panel z-10 flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-background">
            <Minus size={20} />
          </div>
          SubTracks
        </h1>
      </div>
      
      <nav className="flex-1 px-4 mt-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive 
                  ? 'bg-card-border/30 text-accent-primary' 
                  : 'text-foreground/70 hover:text-foreground hover:bg-card-border/20'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge && <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-danger rounded-full"></span>}
              </div>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 mb-4">
        <div className="glass-panel p-4 rounded-xl text-sm hover:bg-card-border/10 cursor-pointer transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-card-border flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=150&q=80" alt="Bombay Cat Avatar" className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="font-semibold text-left">Rohit J.</p>
              <p className="text-foreground/50 text-xs">Pro Member</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import SpendingChart from '@/components/SpendingChart';
import UsageChart from '@/components/UsageChart';
import SubscriptionList from '@/components/SubscriptionList';
import { MOCK_SUBSCRIPTIONS, MOCK_TRANSACTIONS } from '@/data/mock';
import { Wallet, TrendingDown, ShieldAlert, Sparkles, Plus, X, Loader2 } from 'lucide-react';

function generateChartData(subs: typeof MOCK_SUBSCRIPTIONS, range: string) {
  const activeSubs = subs.filter(s => s.status === 'active');
  const monthlyTotal = activeSubs.reduce((acc, sub) => acc + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12), 0);
  
  if (monthlyTotal === 0) {
    return [
      { month: 'Nov', spend: 0 }, { month: 'Dec', spend: 0 }, { month: 'Jan', spend: 0 },
      { month: 'Feb', spend: 0 }, { month: 'Mar', spend: 0 }, { month: 'Apr', spend: 0 },
    ];
  }

  const baseData = [
    { month: 'May', spend: monthlyTotal * 0.75 },
    { month: 'Jun', spend: monthlyTotal * 0.8 },
    { month: 'Jul', spend: monthlyTotal * 0.82 },
    { month: 'Aug', spend: monthlyTotal * 0.88 },
    { month: 'Sep', spend: monthlyTotal * 0.9 },
    { month: 'Oct', spend: monthlyTotal * 0.92 },
    { month: 'Nov', spend: monthlyTotal * 0.85 },
    { month: 'Dec', spend: monthlyTotal * 1.1 },
    { month: 'Jan', spend: monthlyTotal * 0.95 },
    { month: 'Feb', spend: monthlyTotal * 0.98 },
    { month: 'Mar', spend: monthlyTotal * 1.05 },
    { month: 'Apr', spend: monthlyTotal },
  ];

  return range === '1year' ? baseData : baseData.slice(-6);
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [chartData, setChartData] = useState<{ month: string; spend: number }[]>([]);
  const [timeRange, setTimeRange] = useState('6months');

  // Modals state
  const [isBankModalOpen, setBankModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCost, setNewSubCost] = useState('');
  
  const [isAutoCancelModalOpen, setAutoCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [targetCancelId, setTargetCancelId] = useState<string | null>(null);

  const [editingSub, setEditingSub] = useState<any>(null);
  const [usageData, setUsageData] = useState<Record<string, number>>({});

  useEffect(() => {
    setChartData(generateChartData(subscriptions, timeRange));
  }, [subscriptions, timeRange]);

  // Broadcast subscriptions to extension
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('TrimSubSubscriptionsUpdated', { detail: JSON.stringify(subscriptions) }));
    }
  }, [subscriptions]);

  // REST API Polling (Simulating SWR / React Query)
  useEffect(() => {
    const fetchUsageFromDatabase = async () => {
      try {
        const res = await fetch('/api/usage');
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setUsageData(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch usage from API", err);
      }
    };

    // Initial fetch
    fetchUsageFromDatabase();

    // Poll every 5 seconds for the hackathon demo
    const interval = setInterval(fetchUsageFromDatabase, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update risk levels based on usage data
  useEffect(() => {
    if (Object.keys(usageData).length === 0) return;
    
    setSubscriptions(prev => {
      let hasChanges = false;
      const next = prev.map(sub => {
        const timeSpentMs = usageData[sub.id];
        if (timeSpentMs !== undefined && sub.status === 'active') {
          const isHighRisk = timeSpentMs < 21600000; // 6 hours = 21,600,000 ms
          const newRiskLevel = isHighRisk ? 'high' : 'low';
          if (sub.riskLevel !== newRiskLevel) {
            hasChanges = true;
            return { ...sub, riskLevel: newRiskLevel };
          }
        }
        return sub;
      });
      return hasChanges ? next : prev;
    });
  }, [usageData]);

  const usageGraphData = subscriptions
    .filter(sub => sub.status === 'active' && usageData[sub.id] !== undefined)
    .map(sub => ({ name: sub.name, hours: usageData[sub.id] / (1000 * 60 * 60) }));

  const totalMonthly = subscriptions.filter(s => s.status === 'active').reduce((acc, sub) => {
    return acc + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12);
  }, 0);

  const potentialSavings = subscriptions.filter(sub => sub.riskLevel === 'high' && sub.status === 'active')
    .reduce((acc, sub) => acc + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12), 0);

  const highRiskCount = subscriptions.filter(sub => sub.riskLevel === 'high' && sub.status === 'active').length;

  const handleConnectBank = () => {
    setIsConnecting(true);
    setTimeout(() => {
      // Simulate finding a new hidden subscription
      const newSub = {
        id: 'sub_7_' + Date.now(),
        name: 'Hulu (Ad-Free)',
        cost: 17.99,
        billingCycle: 'monthly' as const,
        category: 'Entertainment' as const,
        status: 'active' as const,
        riskLevel: 'high' as const,
        nextBillingDate: '2026-05-12',
        icon: 'Tv'
      };
      setSubscriptions(prev => [...prev, newSub]);
      setIsConnecting(false);
      setBankModalOpen(false);
    }, 2500);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubCost) return;
    
    const newSub = {
      id: 'sub_manual_' + Date.now(),
      name: newSubName,
      cost: parseFloat(newSubCost),
      billingCycle: 'monthly' as const,
      category: 'Other' as const,
      status: 'active' as const,
      riskLevel: 'low' as const,
      nextBillingDate: '2026-05-15',
      icon: 'Package'
    };
    
    setSubscriptions(prev => [...prev, newSub]);
    setNewSubName('');
    setNewSubCost('');
    setAddModalOpen(false);
  };

  const handleAutoCancel = () => {
    setIsCancelling(true);
    setTimeout(() => {
      setSubscriptions(prev => prev.map(sub => 
        sub.riskLevel === 'high' && sub.status === 'active' ? { ...sub, status: 'cancelled' } : sub
      ));
      setIsCancelling(false);
      setAutoCancelModalOpen(false);
    }, 3000);
  };

  const confirmCancelSingle = () => {
    if (!targetCancelId) return;
    setIsCancelling(true);
    setTimeout(() => {
      setSubscriptions(prev => prev.map(sub => 
        sub.id === targetCancelId ? { ...sub, status: 'cancelled' } : sub
      ));
      setIsCancelling(false);
      setTargetCancelId(null);
    }, 1500);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    
    setSubscriptions(prev => prev.map(sub => 
      sub.id === editingSub.id ? { ...sub, name: editingSub.name, cost: parseFloat(editingSub.cost) } : sub
    ));
    setEditingSub(null);
  };

  const openEditModal = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      setEditingSub({ ...sub });
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 md:ml-64 p-6 md:p-10 lg:p-12 max-w-7xl">
        {activeTab === 'dashboard' ? (
          <>
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                <p className="text-foreground/60 mt-1">Here's your subscription breakdown this month.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-card-border hover:bg-card-border/30 transition-colors font-medium">
                  <Plus size={18} />
                  Add Manual
                </button>
                <button 
                  onClick={() => setBankModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium shadow-lg hover-lift">
                  <Sparkles size={18} className="text-accent-primary" />
                  Connect Bank
                </button>
              </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="glass-panel p-6 rounded-2xl hover-lift relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-info/10 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-info/10 flex items-center justify-center text-accent-info">
                    <Wallet size={24} />
                  </div>
                </div>
                <p className="text-foreground/60 text-sm font-medium mb-1">Total Monthly Spend</p>
                <h3 className="text-4xl font-bold tracking-tight">₹{totalMonthly.toFixed(2)}</h3>
              </div>

              <div className="glass-panel p-6 rounded-2xl hover-lift relative overflow-hidden border-accent-primary/30">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-primary/10 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                    <TrendingDown size={24} />
                  </div>
                </div>
                <p className="text-foreground/60 text-sm font-medium mb-1">Potential Savings</p>
                <h3 className="text-4xl font-bold tracking-tight text-accent-primary">₹{potentialSavings.toFixed(2)}</h3>
              </div>

              <div className="glass-panel p-6 rounded-2xl hover-lift relative overflow-hidden border-accent-danger/30">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-danger/10 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-danger/10 flex items-center justify-center text-accent-danger">
                    <ShieldAlert size={24} />
                  </div>
                </div>
                <p className="text-foreground/60 text-sm font-medium mb-1">Zombie Subscriptions</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold tracking-tight text-accent-danger">{highRiskCount}</h3>
                  <span className="text-sm font-medium text-accent-danger/80">Action required</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Spending Trend</h3>
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-transparent border border-card-border rounded-lg px-3 py-1.5 text-sm text-foreground/80 outline-none focus:border-accent-primary"
                  >
                    <option value="6months">Last 6 Months</option>
                    <option value="1year">Last Year</option>
                  </select>
                </div>
                <SpendingChart data={chartData} />
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Screen Time Usage</h3>
                    <p className="text-foreground/40 text-xs mt-0.5">Last month • Min. 6hrs for active status</p>
                  </div>
                </div>
                <UsageChart data={usageGraphData} />
              </div>
            </div>

            {/* Action Section */}
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-card-bg to-accent-danger/5 border border-accent-danger/20 flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-accent-danger/10 flex items-center justify-center text-accent-danger shrink-0">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Trim the Fat</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed max-w-xl">
                    We found <strong>{highRiskCount} subscriptions</strong> you barely used last month (under 6 hours). Cancel them now to instantly save <span className="text-accent-primary font-bold">₹{potentialSavings.toFixed(2)}</span> this month.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setAutoCancelModalOpen(true)}
                disabled={highRiskCount === 0}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-accent-danger text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 hover-lift disabled:opacity-50 disabled:hover:transform-none disabled:shadow-none whitespace-nowrap">
                Auto-Cancel All
              </button>
            </div>

            <SubscriptionList subscriptions={subscriptions} onCancel={(id) => setTargetCancelId(id)} onEdit={openEditModal} />
          </>
        ) : activeTab === 'subscriptions' ? (
          <div>
            <header className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight">All Subscriptions</h2>
              <p className="text-foreground/60 mt-1">Manage and track all your active and cancelled subscriptions.</p>
            </header>
            <SubscriptionList subscriptions={subscriptions} onCancel={(id) => setTargetCancelId(id)} onEdit={openEditModal} />
          </div>
        ) : activeTab === 'transactions' ? (
          <div>
            <header className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Recent Transactions</h2>
              <p className="text-foreground/60 mt-1">Your latest bank transactions analyzed by TrimSub.</p>
            </header>
            <div className="glass-panel rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-card-border bg-card-border/10 text-foreground/60 text-sm">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSACTIONS.map((tx) => (
                    <tr key={tx.id} className="border-b border-card-border/50 hover:bg-card-border/10 transition-colors">
                      <td className="p-4 text-sm text-foreground/70">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                      <td className="p-4 font-medium">{tx.description}</td>
                      <td className="p-4 font-bold text-right">₹{tx.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'alerts' ? (
          <div>
            <header className="mb-10">
              <h2 className="text-3xl font-bold tracking-tight">System Alerts</h2>
              <p className="text-foreground/60 mt-1">Notifications and warnings about your spending.</p>
            </header>
            <div className="space-y-4">
              {subscriptions.filter(s => s.riskLevel === 'high' && s.status === 'active').map(sub => (
                <div key={sub.id} className="glass-panel p-5 rounded-xl border border-accent-danger/30 flex items-start gap-4">
                  <div className="p-3 rounded-full bg-accent-danger/20 text-accent-danger shrink-0">
                    <ShieldAlert size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-accent-danger">High Risk Subscription Detected</h4>
                    <p className="text-foreground/70 mt-1">We noticed you're still paying for <strong>{sub.name}</strong> (₹{sub.cost}/mo) but haven't used it recently.</p>
                  </div>
                  <button 
                    onClick={() => setTargetCancelId(sub.id)}
                    className="px-4 py-2 bg-accent-danger/10 hover:bg-accent-danger text-accent-danger hover:text-white rounded-lg transition-colors font-medium">
                    Cancel Now
                  </button>
                </div>
              ))}
              {subscriptions.filter(s => s.status === 'active' && s.riskLevel !== 'high').slice(0, 1).map(sub => (
                <div key={sub.id + '_billing'} className="glass-panel p-5 rounded-xl border border-card-border flex items-start gap-4">
                  <div className="p-3 rounded-full bg-accent-info/20 text-accent-info shrink-0">
                    <Wallet size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold">Upcoming Bill</h4>
                    <p className="text-foreground/70 mt-1">Your next payment for <strong>{sub.name}</strong> (₹{sub.cost}) is due on {new Date(sub.nextBillingDate).toLocaleDateString('en-GB')}.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      {/* Modals Layer */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border-accent-primary/30 max-w-md w-full rounded-3xl p-8 relative">
            <button onClick={() => !isConnecting && setBankModalOpen(false)} className="absolute top-6 right-6 text-foreground/50 hover:text-foreground">
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center mx-auto mb-6">
                <Wallet size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Connect your Bank</h3>
              <p className="text-foreground/60 text-sm mb-8">Securely link your bank to automatically find hidden subscriptions and analyze spending.</p>
              
              <button 
                onClick={handleConnectBank}
                disabled={isConnecting}
                className="w-full py-3.5 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-all flex justify-center items-center gap-2">
                {isConnecting ? (
                  <><Loader2 size={18} className="animate-spin" /> Syncing data...</>
                ) : 'Link via Plaid (Mock)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-8 relative">
            <button onClick={() => setAddModalOpen(false)} className="absolute top-6 right-6 text-foreground/50 hover:text-foreground">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold mb-6">Add Subscription</h3>
            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Service Name</label>
                <input 
                  type="text" 
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent-primary text-foreground placeholder-foreground/30"
                  placeholder="e.g., ChatGPT Plus"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Monthly Cost (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={newSubCost}
                  onChange={e => setNewSubCost(e.target.value)}
                  className="w-full bg-background border border-card-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent-primary text-foreground placeholder-foreground/30"
                  placeholder="20.00"
                  required
                />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-accent-primary text-background font-medium hover:brightness-110 transition-all mt-4">
                Add to Dashboard
              </button>
            </form>
          </div>
        </div>
      )}

      {isAutoCancelModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border-accent-danger/30 max-w-md w-full rounded-3xl p-8 relative text-center">
            <button onClick={() => !isCancelling && setAutoCancelModalOpen(false)} className="absolute top-6 right-6 text-foreground/50 hover:text-foreground">
              <X size={20} />
            </button>
            <div className="w-16 h-16 rounded-full bg-accent-danger/20 text-accent-danger flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Deploy Cancellation Agent</h3>
            <p className="text-foreground/60 text-sm mb-6">We will securely contact customer support for {highRiskCount} services and request immediate cancellation on your behalf.</p>
            
            <button 
              onClick={handleAutoCancel}
              disabled={isCancelling}
              className="w-full py-3.5 rounded-xl bg-accent-danger text-white font-medium hover:bg-red-600 transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-500/20">
              {isCancelling ? (
                <><Loader2 size={18} className="animate-spin" /> Negotiating with providers...</>
              ) : 'Confirm Auto-Cancel'}
            </button>
          </div>
        </div>
      )}

      {targetCancelId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border-accent-danger/30 max-w-sm w-full rounded-3xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Cancel Service?</h3>
            <p className="text-foreground/60 text-sm mb-6">Are you sure you want to let the AI agent cancel this specific service?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setTargetCancelId(null)}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl border border-card-border hover:bg-card-border/30 transition-colors font-medium">
                Keep it
              </button>
              <button 
                onClick={confirmCancelSingle}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-accent-danger text-white font-medium hover:bg-red-600 transition-colors flex justify-center items-center">
                {isCancelling ? <Loader2 size={16} className="animate-spin" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingSub && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-8 relative">
            <button onClick={() => setEditingSub(null)} className="absolute top-6 right-6 text-foreground/50 hover:text-foreground">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold mb-6">Edit Subscription</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Service Name</label>
                <input 
                  type="text" 
                  value={editingSub.name}
                  onChange={e => setEditingSub({ ...editingSub, name: e.target.value })}
                  className="w-full bg-background border border-card-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent-primary text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">Monthly Cost (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editingSub.cost}
                  onChange={e => setEditingSub({ ...editingSub, cost: e.target.value })}
                  className="w-full bg-background border border-card-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent-primary text-foreground"
                  required
                />
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl bg-accent-primary text-background font-medium hover:brightness-110 transition-all mt-4">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

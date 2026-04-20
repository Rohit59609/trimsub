'use client';

import { Tv, PenTool, Music, Dumbbell, Shield, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Subscription } from '@/data/mock';

const iconMap: Record<string, any> = {
  Tv, PenTool, Music, Dumbbell, Shield, Package
};

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onCancel: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function SubscriptionList({ subscriptions, onCancel, onEdit }: SubscriptionListProps) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden mt-8">
      <div className="p-6 border-b border-card-border flex justify-between items-center">
        <h2 className="text-xl font-semibold">Active Subscriptions</h2>
        <button className="text-sm text-accent-primary hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-card-border bg-card-border/10 text-foreground/60 text-sm">
              <th className="p-4 font-medium">Service</th>
              <th className="p-4 font-medium">Cost</th>
              <th className="p-4 font-medium">Next Billing</th>
              <th className="p-4 font-medium">Risk / Utility</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const Icon = sub.icon && iconMap[sub.icon] ? iconMap[sub.icon] : Package;
              const isHighRisk = sub.riskLevel === 'high';
              const isCancelled = sub.status === 'cancelled';

              return (
                <tr key={sub.id} className={`border-b border-card-border/50 hover:bg-card-border/10 transition-colors group ${isCancelled ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHighRisk && !isCancelled ? 'bg-accent-danger/20 text-accent-danger' : isCancelled ? 'bg-card-border/50 text-foreground/50' : 'bg-card-border text-foreground'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className={`font-semibold ${isCancelled ? 'line-through' : ''}`}>{sub.name}</p>
                        <p className="text-xs text-foreground/50">{sub.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">
                    ₹{sub.cost.toFixed(2)}<span className="text-xs text-foreground/50 font-normal">/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </td>
                  <td className="p-4 text-sm text-foreground/70">
                    {isCancelled ? '-' : new Date(sub.nextBillingDate).toLocaleDateString('en-GB')}
                  </td>
                  <td className="p-4">
                    {isCancelled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/10 text-foreground/60 text-xs font-medium border border-card-border">
                        <CheckCircle2 size={12} /> Cancelled
                      </span>
                    ) : isHighRisk ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-danger/10 text-accent-danger text-xs font-medium border border-accent-danger/20">
                        <AlertTriangle size={12} /> Low Usage
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-medium border border-accent-primary/20">
                        Active Use
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {isCancelled ? (
                      <span className="text-sm font-medium text-foreground/50">N/A</span>
                    ) : isHighRisk ? (
                      <button 
                        onClick={() => onCancel(sub.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-accent-danger text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 hover-lift">
                        Cancel Now
                      </button>
                    ) : (
                      <button 
                        onClick={() => onEdit && onEdit(sub.id)}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-card-border hover:bg-card-border/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

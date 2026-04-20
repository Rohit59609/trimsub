export type Subscription = {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  category: 'Entertainment' | 'Software' | 'Utilities' | 'Health' | 'Other';
  status: 'active' | 'cancelled';
  riskLevel: 'low' | 'medium' | 'high';
  cancelUrl?: string;
  nextBillingDate: string;
  icon?: string;
};

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    name: 'Netflix',
    cost: 199.00,
    billingCycle: 'monthly',
    category: 'Entertainment',
    status: 'active',
    riskLevel: 'low',
    cancelUrl: 'https://www.netflix.com/cancelplan',
    nextBillingDate: '2026-05-01',
    icon: 'Tv'
  },
  {
    id: 'sub_2',
    name: 'Adobe Creative Cloud',
    cost: 4230.00,
    billingCycle: 'monthly',
    category: 'Software',
    status: 'active',
    riskLevel: 'high',
    cancelUrl: 'https://account.adobe.com/plans',
    nextBillingDate: '2026-04-25',
    icon: 'PenTool'
  },
  {
    id: 'sub_3',
    name: 'Spotify',
    cost: 119.00,
    billingCycle: 'monthly',
    category: 'Entertainment',
    status: 'active',
    riskLevel: 'low',
    cancelUrl: 'https://www.spotify.com/us/account/overview/',
    nextBillingDate: '2026-05-10',
    icon: 'Music'
  },

  {
    id: 'sub_5',
    name: 'Forgotten VPN Service',
    cost: 399.00,
    billingCycle: 'monthly',
    category: 'Software',
    status: 'active',
    riskLevel: 'high',
    cancelUrl: 'https://example-vpn.com/cancel',
    nextBillingDate: '2026-04-21',
    icon: 'Shield'
  },
  {
    id: 'sub_6',
    name: 'Amazon Prime',
    cost: 299.00,
    billingCycle: 'monthly',
    category: 'Entertainment',
    status: 'active',
    riskLevel: 'low',
    cancelUrl: 'https://www.amazon.com/mc/manage',
    nextBillingDate: '2026-11-15',
    icon: 'Package'
  }
];

export const MOCK_TRANSACTIONS = [
  { id: 'tx_1', date: '2026-04-01', description: 'PURCHASE NETFLIX.COM', amount: 199.00 },
  { id: 'tx_2', date: '2026-03-25', description: 'ADOBE *CREATIVE CLOUD', amount: 4230.00 },
  { id: 'tx_3', date: '2026-04-10', description: 'SPOTIFY INDIA', amount: 119.00 },
  { id: 'tx_4', date: '2026-04-05', description: 'ACH PENDING GYM', amount: 2000.00 },
  { id: 'tx_5', date: '2026-03-21', description: 'PAYPAL *VPN SERVICE', amount: 399.00 }
];

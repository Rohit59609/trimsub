'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpendingChartProps {
  data: { month: string; spend: number }[];
}

// Custom active dot with pulse animation
function PulseActiveDot(props: any) {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="#00e59b" opacity={0.15}>
        <animate attributeName="r" from="6" to="16" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={5} fill="#050505" stroke="#00e59b" strokeWidth={2.5} />
    </g>
  );
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;

  return (
    <div style={{
      background: 'rgba(10, 10, 10, 0.95)',
      border: '1px solid rgba(0, 229, 155, 0.3)',
      borderRadius: '12px',
      padding: '14px 18px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 229, 155, 0.1)',
      backdropFilter: 'blur(12px)',
      minWidth: '140px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: '0 0 4px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ color: '#00e59b', fontWeight: 800, fontSize: 24, margin: 0, letterSpacing: '-0.5px' }}>
        ₹{value.toFixed(2)}
      </p>
    </div>
  );
}

// Custom dot for each data point
function RenderDot(props: any) {
  const { cx, cy, index, payload } = props;
  // Show dots only at first and last points
  if (index !== 0 && index !== props.dataLength - 1) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="#00e59b"
      stroke="#050505"
      strokeWidth={2}
    />
  );
}

export default function SpendingChart({ data }: SpendingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 w-full flex flex-col items-center justify-center text-foreground/40 gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        <span className="text-sm">Loading spending data...</span>
      </div>
    );
  }

  const maxSpend = Math.max(...data.map(d => d.spend));
  const minSpend = Math.min(...data.map(d => d.spend));
  const avgSpend = data.reduce((sum, d) => sum + d.spend, 0) / data.length;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e59b" stopOpacity={0.35} />
              <stop offset="50%" stopColor="#00e59b" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#00e59b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00e59b" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#00e59b" stopOpacity={1} />
              <stop offset="100%" stopColor="#00e59b" stopOpacity={0.8} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.05)"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 500 }}
            dy={8}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}
            dx={-5}
            tickFormatter={(val) => `₹${Math.round(val)}`}
            width={55}
            domain={[minSpend * 0.9, maxSpend * 1.08]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: 'rgba(0, 229, 155, 0.4)',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="url(#lineGradient)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#spendGradient)"
            activeDot={<PulseActiveDot />}
            dot={false}
            animationDuration={1800}
            animationEasing="ease-out"
            style={{ filter: 'url(#glow)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

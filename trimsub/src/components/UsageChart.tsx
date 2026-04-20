'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface UsageChartProps {
  data: { name: string; hours: number }[];
}

const THRESHOLD = 6; // hours over 30 days (~12 min/day avg)

// Shorten long service names for the axis
function shortenName(name: string): string {
  const map: Record<string, string> = {
    'Adobe Creative Cloud': 'Adobe CC',
    'Forgotten VPN Service': 'VPN',
    'Spotify Premium': 'Spotify',
    'Amazon Prime': 'Prime',
  };
  return map[name] || (name.length > 12 ? name.slice(0, 10) + '…' : name);
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const hours = payload[0].value;
  const isLow = hours < THRESHOLD;

  return (
    <div style={{
      background: 'rgba(20, 20, 20, 0.95)',
      border: `1px solid ${isLow ? '#ff4757' : '#00e59b'}`,
      borderRadius: '12px',
      padding: '12px 16px',
      boxShadow: `0 8px 32px ${isLow ? 'rgba(255, 71, 87, 0.3)' : 'rgba(0, 229, 155, 0.2)'}`,
    }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0 }}>{label}</p>
      <p style={{ color: isLow ? '#ff4757' : '#00e59b', fontWeight: 800, fontSize: 22, margin: '4px 0 2px' }}>
        {hours.toFixed(1)} hrs
      </p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0 }}>
        {isLow ? '⚠ Under 6hrs last month — Zombie risk' : '✓ Actively used this period'}
      </p>
    </div>
  );
}

// Custom bar label
function RenderBarLabel(props: any) {
  const { x, y, width, value } = props;
  const isLow = value < THRESHOLD;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={isLow ? '#ff4757' : '#00e59b'}
      textAnchor="middle"
      fontSize={12}
      fontWeight={700}
    >
      {value.toFixed(1)}h
    </text>
  );
}

// Custom X-axis tick with color coding
function CustomXAxisTick(props: any) {
  const { x, y, payload } = props;
  // Find the original entry to check hours
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize={11}
        fontWeight={500}
      >
        {payload.value}
      </text>
    </g>
  );
}

export default function UsageChart({ data }: UsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 w-full flex flex-col items-center justify-center text-foreground/40 gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <span className="text-sm">Sync screen time from the extension</span>
      </div>
    );
  }

  // Shorten names and sort descending
  const sorted = [...data]
    .sort((a, b) => b.hours - a.hours)
    .map(d => ({ ...d, shortName: shortenName(d.name) }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          margin={{ top: 25, right: 10, left: -10, bottom: 10 }}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e59b" stopOpacity={1} />
              <stop offset="100%" stopColor="#00e59b" stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4757" stopOpacity={1} />
              <stop offset="100%" stopColor="#ff4757" stopOpacity={0.35} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="shortName"
            axisLine={false}
            tickLine={false}
            tick={<CustomXAxisTick />}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            dx={-5}
            tickFormatter={(val) => `${val}h`}
            width={40}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <ReferenceLine
            y={THRESHOLD}
            stroke="#ff4757"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            strokeOpacity={0.6}
            label={{
              value: '6hr min (30 days)',
              position: 'insideTopRight',
              fill: '#ff4757',
              fontSize: 10,
              fontWeight: 600,
              opacity: 0.7,
            }}
          />
          <Bar
            dataKey="hours"
            radius={[6, 6, 0, 0]}
            animationDuration={1200}
            animationEasing="ease-out"
            label={<RenderBarLabel />}
            maxBarSize={60}
          >
            {sorted.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.hours < THRESHOLD ? 'url(#barRed)' : 'url(#barGreen)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

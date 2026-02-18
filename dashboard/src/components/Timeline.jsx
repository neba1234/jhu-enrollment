import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Card, SectionTitle } from './UI';

function TimelineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '.6rem .8rem',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '.8rem',
      }}
    >
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div>New enrollments: <strong>{payload[0].value}</strong></div>
    </div>
  );
}

export default function Timeline({ timeline }) {
  return (
    <div>
      <SectionTitle
        title="Enrollment Timeline"
        subtitle="Monthly course enrollment starts — activity peaked in early 2023 and sustained through the year."
      />
      <Card>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={timeline} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#002D72" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#002D72" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#4A5568' }}
              axisLine={{ stroke: '#e2e0dc' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#4A5568' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<TimelineTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#002D72"
              strokeWidth={2.5}
              fill="url(#navyGrad)"
              dot={{ r: 4, fill: '#002D72', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6, fill: '#CF8A00', strokeWidth: 2, stroke: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { Card, SectionTitle } from './UI';

const NAVY = '#002D72';
const GOLD = '#CF8A00';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '.75rem 1rem',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '.82rem',
      }}
    >
      <div style={{ fontWeight: 700, color: NAVY, marginBottom: '.3rem' }}>
        {d.city}, {d.state}
      </div>
      <div>Enrollments: <strong>{d.total}</strong></div>
      <div>Completed: <strong>{d.completed}</strong></div>
      <div>In Progress: <strong>{d.inProgress}</strong></div>
      <div>Avg Score: <strong>{d.avgScore}%</strong></div>
      <div>Leaders: <strong>{d.leaderCount}</strong></div>
      <div style={{ fontSize: '.75rem', color: 'var(--slate)', marginTop: '.2rem' }}>
        {d.region}
      </div>
    </div>
  );
}

export default function CityChart({ cityStats }) {
  const data = cityStats.map((c) => ({
    ...c,
    label: `${c.city}, ${c.state}`,
  }));

  return (
    <div>
      <SectionTitle
        title="Where We've Had the Most Impact"
        subtitle="Course enrollments by city — Baltimore, San Francisco, and Austin lead in total engagement."
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <Card>
          <div style={{ fontSize: '.78rem', color: 'var(--slate)', marginBottom: '.5rem', display: 'flex', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: NAVY, display: 'inline-block' }} />
              Completed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: GOLD, display: 'inline-block' }} />
              In Progress
            </span>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                tick={{ fontSize: 12, fontWeight: 500, fill: '#1a202c' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,45,114,.04)' }} />
              <Bar dataKey="completed" stackId="a" radius={[0, 0, 0, 0]} barSize={22}>
                {data.map((_, i) => (
                  <Cell key={i} fill={NAVY} />
                ))}
              </Bar>
              <Bar dataKey="inProgress" stackId="a" radius={[0, 4, 4, 0]} barSize={22}>
                {data.map((_, i) => (
                  <Cell key={i} fill={GOLD} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, fontSize: '.85rem', marginBottom: '.75rem', color: 'var(--navy)' }}>
            City Engagement Overview
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '.6rem' }}>
            {cityStats.map((c) => (
              <div
                key={c.city}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.5rem',
                  padding: '.5rem .6rem',
                  background: '#f7f6f3',
                  borderRadius: 8,
                  fontSize: '.78rem',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: NAVY,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '.72rem',
                    flexShrink: 0,
                  }}
                >
                  {c.total}
                </div>
                <div>
                  <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{c.city}, {c.state}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--slate)' }}>
                    {c.region} · {c.avgScore}% avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

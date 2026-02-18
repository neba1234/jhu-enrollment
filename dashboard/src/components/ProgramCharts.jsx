import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import { Card, SectionTitle, Badge } from './UI';

const NAVY = '#002D72';
const BLUE = '#005EB8';
const GOLD = '#CF8A00';

function CenterRing({ name, count, total, avgScore, color }) {
  const data = [
    { name, value: count },
    { name: 'rest', value: total - count },
  ];
  return (
    <div style={{ textAlign: 'center' }}>
      <Badge type={name === 'GovEx' ? 'govex' : 'bcpi'}>
        {name}
      </Badge>
      <div style={{ width: 140, height: 140, margin: '.5rem auto 0' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={58}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#f0eee9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: '-90px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: NAVY }}>
          {count}
        </div>
        <div style={{ fontSize: '.7rem', color: 'var(--slate)' }}>enrollments</div>
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--slate)', marginTop: '3rem' }}>
        Avg score: <strong>{avgScore}%</strong>
      </div>
    </div>
  );
}

function CourseTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
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
      <div style={{ fontWeight: 600, marginBottom: '.15rem' }}>{d.name}</div>
      <div>Enrollments: <strong>{d.count}</strong></div>
    </div>
  );
}

export default function ProgramCharts({ centerStats, courseStats }) {
  const total = centerStats.reduce((a, c) => a + c.count, 0);
  const topCourses = courseStats.slice(0, 8).map((c) => ({
    ...c,
    shortName: c.name.length > 22 ? c.name.slice(0, 22) + '…' : c.name,
  }));

  return (
    <div>
      <SectionTitle
        title="Program Center Breakdown"
        subtitle={`BCPI leads with ${centerStats.find(c => c.name === 'BCPI')?.count || 0} enrollments (${centerStats.find(c => c.name === 'BCPI')?.pct || 0}%), GovEx at ${centerStats.find(c => c.name === 'GovEx')?.count || 0} (${centerStats.find(c => c.name === 'GovEx')?.pct || 0}%).`}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '1rem 0' }}>
            {centerStats.map((c) => (
              <CenterRing
                key={c.name}
                name={c.name}
                count={c.count}
                total={total}
                avgScore={c.avgScore}
                color={c.name === 'GovEx' ? BLUE : GOLD}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ fontWeight: 600, fontSize: '.85rem', marginBottom: '.75rem', color: NAVY }}>
            Most Popular Courses
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCourses} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="shortName"
                width={140}
                tick={{ fontSize: 11, fill: '#4A5568' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CourseTooltip />} cursor={{ fill: 'rgba(207,138,0,.08)' }} />
              <Bar dataKey="count" radius={[0, 5, 5, 0]} barSize={18}>
                {topCourses.map((c, i) => (
                  <Cell key={i} fill={c.center === 'GovEx' ? BLUE : GOLD} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

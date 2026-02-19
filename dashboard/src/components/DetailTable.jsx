import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Card, SectionTitle, Badge } from './UI';

function shortName(fullName) {
  if (!fullName) return '—';
  const titles = ['Mayor', 'CTO', 'Deputy', 'Chief', 'City', 'Innovation', 'Budget', 'Data', 'Policy'];
  const parts = fullName.split(' ');
  let start = 0;
  for (let i = 0; i < parts.length - 1; i++) {
    if (titles.includes(parts[i])) start = i + 1;
    else break;
  }
  const name = parts.slice(start);
  return name.length >= 2 ? name[0][0] + '. ' + name.slice(1).join(' ') : name.join(' ');
}

const columns = [
  { key: 'leader_name', label: 'Leader', width: '15%' },
  { key: 'city', label: 'City', width: '12%' },
  { key: 'course_name', label: 'Course', width: '25%' },
  { key: 'program_center', label: 'Program', width: '10%' },
  { key: 'duration_weeks', label: 'Weeks', width: '8%' },
  { key: 'completion_status', label: 'Status', width: '12%' },
  { key: 'score', label: 'Score', width: '8%' },
];

export default function DetailTable({ enrollments, leaders }) {
  const [sortKey, setSortKey] = useState('city');
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('');

  const leaderMap = useMemo(() => {
    const m = {};
    leaders.forEach((l) => { m[l.record_id] = l; });
    return m;
  }, [leaders]);

  const sorted = useMemo(() => {
    let data = [...enrollments];

    // Filter
    if (filter) {
      const q = filter.toLowerCase();
      data = data.filter(
        (e) =>
          (e.leader_name || '').toLowerCase().includes(q) ||
          (e.city || '').toLowerCase().includes(q) ||
          (e.course_name || '').toLowerCase().includes(q) ||
          (e.program_center || '').toLowerCase().includes(q)
      );
    }

    // Sort
    data.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      av = String(av ?? '');
      bv = String(bv ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return data;
  }, [enrollments, sortKey, sortDir, filter]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc'
      ? <ChevronUp size={13} style={{ marginLeft: 2, opacity: .6 }} />
      : <ChevronDown size={13} style={{ marginLeft: 2, opacity: .6 }} />;
  };

  return (
    <div>
      <SectionTitle
        title="Leader-Level Detail"
        subtitle={`All ${enrollments.length} course enrollments — click column headers to sort.`}
      />
      <Card style={{ overflowX: 'auto' }}>
        {/* Search */}
        <div style={{ marginBottom: '.75rem', position: 'relative', maxWidth: 280 }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)', opacity: .5 }}
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search leaders, cities, courses…"
            style={{
              width: '100%',
              padding: '.45rem .6rem .45rem 2rem',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontSize: '.82rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              background: '#f7f6f3',
              transition: 'border-color .15s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--blue-mid)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    textAlign: 'left',
                    padding: '.55rem .65rem',
                    fontWeight: 600,
                    fontSize: '.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    color: 'var(--slate)',
                    borderBottom: '2px solid var(--navy)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((e, i) => {
              const leader = leaderMap[e.record_id] || {};
              return (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(0,45,114,.02)'; }}
                  onMouseLeave={(ev) => { ev.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '.55rem .65rem', fontWeight: 500 }}>
                    <div>{shortName(e.leader_name)}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--slate)', fontWeight: 400 }}>
                      {leader.title || ''}
                    </div>
                  </td>
                  <td style={{ padding: '.55rem .65rem' }}>{e.city}, {e.state}</td>
                  <td style={{ padding: '.55rem .65rem' }}>{e.course_name}</td>
                  <td style={{ padding: '.55rem .65rem' }}>
                    <Badge type={e.program_center === 'GovEx' ? 'govex' : 'bcpi'}>
                      {e.program_center}
                    </Badge>
                  </td>
                  <td style={{ padding: '.55rem .65rem', textAlign: 'center' }}>{e.duration_weeks}</td>
                  <td style={{ padding: '.55rem .65rem' }}>
                    <Badge type={e.completion_status === 'Completed' ? 'completed' : 'progress'}>
                      {e.completion_status}
                    </Badge>
                  </td>
                  <td style={{ padding: '.55rem .65rem' }}>
                    {e.score != null ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', fontWeight: 600, fontSize: '.8rem' }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: e.score >= 90 ? 'var(--success)' : 'var(--gold)',
                        }} />
                        {e.score}%
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate)', fontSize: '.85rem' }}>
            No results found for "{filter}"
          </div>
        )}
      </Card>
    </div>
  );
}

import { Users, MapPin, BookOpen, CheckCircle, Trophy } from 'lucide-react';

const styles = {
  strip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
    margin: '-1.8rem 0 2rem',
    position: 'relative',
    zIndex: 2,
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius)',
    padding: '1.25rem 1.25rem 1rem',
    boxShadow: 'var(--shadow-lg)',
    borderTop: '3px solid var(--navy)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '.75rem',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  value: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(1.4rem, 5vw, 1.85rem)',
    fontWeight: 700,
    color: 'var(--navy)',
    lineHeight: 1.1,
  },
  label: {
    fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)',
    fontWeight: 500,
    color: 'var(--slate)',
    marginTop: '.2rem',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
  },
};

const kpiConfig = [
  { key: 'totalLeaders', label: 'Government Leaders', icon: Users, color: '#e8f0f8' },
  { key: 'totalCities', label: 'Cities Reached', icon: MapPin, color: '#e8f0f8' },
  { key: 'totalEnrollments', label: 'Course Enrollments', icon: BookOpen, color: '#e8f0f8' },
  { key: 'completionRate', label: 'Completion Rate', icon: CheckCircle, color: 'var(--success-bg)', suffix: '%' },
  { key: 'avgScore', label: 'Avg Score (Completed)', icon: Trophy, color: 'var(--gold-light)', suffix: '%' },
];

export default function KPIStrip({ kpis }) {
  return (
    <div className="kpi-strip" style={styles.strip}>
      {kpiConfig.map(({ key, label, icon: Icon, color, suffix }) => (
        <div key={key} className="kpi-card" style={styles.card}>
          <div style={{ ...styles.iconWrap, background: color }}>
            <Icon size={18} color="var(--navy)" />
          </div>
          <div>
            <div className="kpi-value" style={styles.value}>
              {kpis[key]}{suffix || ''}
            </div>
            <div className="kpi-label" style={styles.label}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

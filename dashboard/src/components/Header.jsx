import { GraduationCap } from 'lucide-react';

const styles = {
  header: {
    background: 'linear-gradient(135deg, var(--navy-deep) 0%, var(--navy) 50%, var(--blue-mid) 100%)',
    color: 'white',
    padding: '2.5rem 2rem 2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '-60%',
    right: '-10%',
    width: 500,
    height: 500,
    background: 'radial-gradient(circle, rgba(207,138,0,.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.4rem',
    fontSize: '.7rem',
    fontWeight: 600,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    background: 'rgba(255,255,255,.12)',
    border: '1px solid rgba(255,255,255,.2)',
    padding: '.3rem .8rem',
    borderRadius: 20,
    marginBottom: '1rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-.02em',
    marginBottom: '.35rem',
    lineHeight: 1.15,
  },
  subtitle: {
    opacity: .8,
    fontSize: '.95rem',
    maxWidth: 520,
    lineHeight: 1.5,
  },
  date: {
    fontSize: '.75rem',
    opacity: .5,
    marginTop: '.75rem',
    fontWeight: 500,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
  },
};

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.glow} />
      <div style={styles.inner}>
        <div>
          <div style={styles.badge}>
            <GraduationCap size={14} />
            Johns Hopkins University · School of Government &amp; Policy
          </div>
          <h1 style={styles.title}>Enrollment Impact Dashboard</h1>
          <p style={styles.subtitle}>
            Program engagement and completion metrics across 12 cities — prepared for the Dean's review.
          </p>
          <p style={styles.date}>Data as of December 2025</p>
        </div>
      </div>
    </header>
  );
}

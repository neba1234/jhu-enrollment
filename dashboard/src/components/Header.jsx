import { GraduationCap, Moon, Sun, Zap } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useEnrollmentData } from '../data/useEnrollmentDataLive';

const styles = {
  header: {
    background: 'linear-gradient(135deg, var(--navy-deep) 0%, var(--navy) 50%, var(--blue-mid) 100%)',
    color: 'white',
    padding: '2.5rem 2rem 2rem',
    position: 'relative',
    overflow: 'hidden',
    animation: 'fadeIn 0.6s ease-in-out',
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
    gap: '2rem',
  },
  themeToggle: {
    background: 'rgba(255,255,255,.12)',
    border: '1px solid rgba(255,255,255,.2)',
    color: 'white',
    padding: '.6rem .8rem',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
    transition: 'all 0.3s ease',
    marginBottom: '.5rem',
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
    animation: 'slideInLeft 0.6s ease-out',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 700,
    letterSpacing: '-.02em',
    marginBottom: '.35rem',
    lineHeight: 1.15,
    animation: 'slideUp 0.6s ease-out 0.1s both',
  },
  subtitle: {
    opacity: .8,
    fontSize: '.95rem',
    maxWidth: 520,
    lineHeight: 1.5,
    animation: 'slideUp 0.6s ease-out 0.2s both',
  },
  date: {
    fontSize: '.75rem',
    opacity: .5,
    marginTop: '.75rem',
    fontWeight: 500,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
    animation: 'slideUp 0.6s ease-out 0.3s both',
  },
};

export default function Header() {
  const [isDark, setIsDark] = useDarkMode();
  const { isLiveMode } = useEnrollmentData();

  return (
    <header style={styles.header}>
      <div style={styles.glow} />
      <div style={styles.inner}>
        <div>
          <div style={styles.badge}>
            {isLiveMode && (
              <>
                <Zap size={14} style={{ color: '#EAB308' }} />
                <span style={{ color: '#EAB308', fontWeight: 700 }}>● LIVE</span>
                <span>•</span>
              </>
            )}
            <GraduationCap size={14} />
            Johns Hopkins University · School of Government &amp; Policy
          </div>
          <h1 style={styles.title}>Enrollment Impact Dashboard</h1>
          <p style={styles.subtitle}>
            Program engagement and completion metrics across 12 cities — prepared for the Dean's review.
          </p>
          <p style={styles.date}>Data as of December 2025</p>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          style={styles.themeToggle}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span style={{ fontSize: '.8rem' }}>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
}

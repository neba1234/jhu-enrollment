export function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: '1.5rem',
        border: '1px solid var(--border)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--navy)',
          marginBottom: '.15rem',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '.85rem', color: 'var(--slate)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Badge({ type, children }) {
  const colors = {
    completed: { background: 'var(--success-bg)', color: 'var(--success)' },
    progress: { background: 'var(--in-progress-bg)', color: 'var(--in-progress)' },
    govex: { background: 'var(--sky-light)', color: 'var(--navy)' },
    bcpi: { background: 'var(--gold-light)', color: '#7c5300' },
  };
  const c = colors[type] || colors.completed;
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '.68rem',
        fontWeight: 600,
        padding: '.15rem .5rem',
        borderRadius: 12,
        letterSpacing: '.02em',
        ...c,
      }}
    >
      {children}
    </span>
  );
}

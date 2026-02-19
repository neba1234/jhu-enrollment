import { RefreshCw } from 'lucide-react';

export default function RefreshButton({ onRefresh, loading, lastRefreshed, isLiveMode }) {
  if (!isLiveMode) return null;

  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      background: 'var(--gold)',
      borderRadius: 'var(--radius)',
      fontSize: '0.85rem',
      fontWeight: 500,
      color: 'var(--navy)',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        🔴 LIVE MODE
        {lastRefreshed && (
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            · Updated {formatTime(lastRefreshed)}
          </span>
        )}
      </span>
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.35rem 0.6rem',
          background: 'white',
          border: 'none',
          borderRadius: 'var(--radius)',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.8rem',
          fontWeight: 500,
          color: 'var(--navy)',
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <RefreshCw 
          size={14} 
          style={{ 
            animation: loading ? 'spin 1s linear infinite' : 'none',
          }} 
        />
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

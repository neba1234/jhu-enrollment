// Live enrollment dashboard — fetches from Vercel backend API
import { useEnrollmentData } from './data/useEnrollmentDataLive';
import Header from './components/Header';
import KPIStrip from './components/KPIStrip';
import CityChart from './components/CityChart';
import ProgramCharts from './components/ProgramCharts';
import Timeline from './components/Timeline';
import DetailTable from './components/DetailTable';
import Insights from './components/Insights';
import RefreshButton from './components/RefreshButton';

const sectionStyle = { marginBottom: '2rem' };

export default function App() {
  const {
    leaders,
    enrollments,
    cityStats,
    courseStats,
    centerStats,
    kpis,
    timeline,
    // Live data props
    isLiveMode,
    loading,
    error,
    lastRefreshed,
    refresh,
  } = useEnrollmentData();

  return (
    <div>
      <Header isLiveMode={isLiveMode} error={error} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        {/* Show refresh button if in live mode */}
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <RefreshButton 
            onRefresh={refresh} 
            loading={loading} 
            lastRefreshed={lastRefreshed}
            isLiveMode={isLiveMode}
          />
        </div>

        {/* Show loading spinner while data is being fetched */}
        {loading && !error && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            gap: '1rem',
          }}>
            <div style={{
              width: 48,
              height: 48,
              border: '4px solid var(--border)',
              borderTop: '4px solid var(--gold)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Loading live data from Airtable...</p>
          </div>
        )}

        {/* Show error message if live data failed */}
        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: '#FEE2E2',
            border: '1px solid #EF4444',
            borderRadius: 'var(--radius)',
            color: '#991B1B',
            fontSize: '0.875rem',
          }}>
            ⚠️ Failed to load live data: {error}
          </div>
        )}

        {/* Show info message when live data has incomplete records */}
        {!error && kpis.completionRate === 0 && kpis.totalEnrollments > 0 && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            background: '#DBEAFE',
            border: '1px solid #3B82F6',
            borderRadius: 'var(--radius)',
            color: '#1E40AF',
            fontSize: '0.875rem',
          }}>
            ℹ️ <strong>Live Mode:</strong> Showing {kpis.totalEnrollments} enrollments from Airtable. 
            Completion metrics appear as "—" because <code>completion_status</code> and <code>score</code> fields 
            are not populated in the live data. This demonstrates real-world data validation needs.
          </div>
        )}

        {!loading && <KPIStrip kpis={kpis} />}

        {!loading && <div style={sectionStyle}>
          <CityChart cityStats={cityStats} />
        </div>}

        {!loading && <div style={sectionStyle}>
          <ProgramCharts centerStats={centerStats} courseStats={courseStats} />
        </div>}

        {!loading && <div style={sectionStyle}>
          <Timeline timeline={timeline} />
        </div>}

        {!loading && <div style={sectionStyle}>
          <DetailTable enrollments={enrollments} leaders={leaders} />
        </div>}

        {!loading && <div style={sectionStyle}>
          <Insights />
        </div>}

        <footer
          style={{
            textAlign: 'center',
            padding: '1.5rem',
            fontSize: '.75rem',
            color: 'var(--slate)',
            borderTop: '1px solid var(--border)',
            marginTop: '1rem',
          }}
        >
          Prepared for the Dean's Review · JHU School of Government &amp; Policy
        </footer>
      </div>
    </div>
  );
}

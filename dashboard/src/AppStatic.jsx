// Static version - Pure JSON, no Airtable
import { useEnrollmentData } from './data/useEnrollmentData';
import Header from './components/Header';
import KPIStrip from './components/KPIStrip';
import CityChart from './components/CityChart';
import ProgramCharts from './components/ProgramCharts';
import Timeline from './components/Timeline';
import DetailTable from './components/DetailTable';
import Insights from './components/Insights';

const sectionStyle = { marginBottom: '2rem' };

export default function AppStatic() {
  const {
    leaders,
    enrollments,
    cityStats,
    courseStats,
    centerStats,
    kpis,
    timeline,
  } = useEnrollmentData();

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
        }}>
          📊 <strong>Static Version:</strong> Using bundled JSON data. This version works everywhere without requiring a backend server.
        </div>

        <KPIStrip kpis={kpis} />

        <div style={sectionStyle}>
          <CityChart cityStats={cityStats} />
        </div>

        <div style={sectionStyle}>
          <ProgramCharts centerStats={centerStats} courseStats={courseStats} />
        </div>

        <div style={sectionStyle}>
          <Timeline timeline={timeline} />
        </div>

        <div style={sectionStyle}>
          <DetailTable enrollments={enrollments} leaders={leaders} />
        </div>

        <div style={sectionStyle}>
          <Insights />
        </div>
      </div>
    </div>
  );
}

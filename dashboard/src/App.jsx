import { useEnrollmentData } from './data/useEnrollmentData';
import Header from './components/Header';
import KPIStrip from './components/KPIStrip';
import CityChart from './components/CityChart';
import ProgramCharts from './components/ProgramCharts';
import Timeline from './components/Timeline';
import DetailTable from './components/DetailTable';
import Insights from './components/Insights';

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
  } = useEnrollmentData();

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
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
          Prepared for the Dean's Review · JHU School of Government &amp; Policy · Data as of December 2025
        </footer>
      </div>
    </div>
  );
}

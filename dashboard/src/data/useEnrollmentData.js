import { useMemo } from 'react';
import rawData from '../data/enrollment_data.json';

export function useEnrollmentData() {
  return useMemo(() => {
    const { leaders, cities, enrollments } = rawData;

    // --- City-level aggregation ---
    const cityMap = {};
    enrollments.forEach((e) => {
      if (!cityMap[e.city]) {
        const cityInfo = cities.find((c) => c.name === e.city) || {};
        cityMap[e.city] = {
          city: e.city,
          state: e.state,
          region: cityInfo.region || '',
          population: cityInfo.population || 0,
          budget: cityInfo.budget || '',
          total: 0,
          completed: 0,
          inProgress: 0,
          scores: [],
          leaders: new Set(),
        };
      }
      const c = cityMap[e.city];
      c.total++;
      if (e.completion_status === 'Completed') {
        c.completed++;
        if (e.score != null) c.scores.push(e.score);
      } else {
        c.inProgress++;
      }
      c.leaders.add(e.record_id);
    });

    const cityStats = Object.values(cityMap)
      .map((c) => ({
        ...c,
        leaderCount: c.leaders.size,
        avgScore: c.scores.length ? +(c.scores.reduce((a, b) => a + b, 0) / c.scores.length).toFixed(1) : 0,
        completionRate: c.total ? +((c.completed / c.total) * 100).toFixed(0) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // --- Course popularity ---
    const courseMap = {};
    enrollments.forEach((e) => {
      if (!courseMap[e.course_name]) {
        courseMap[e.course_name] = { name: e.course_name, count: 0, center: e.program_center };
      }
      courseMap[e.course_name].count++;
    });
    const courseStats = Object.values(courseMap).sort((a, b) => b.count - a.count);

    // --- Program center breakdown ---
    const centerMap = { GovEx: { count: 0, scores: [] }, BCPI: { count: 0, scores: [] } };
    enrollments.forEach((e) => {
      const key = e.program_center;
      if (centerMap[key]) {
        centerMap[key].count++;
        if (e.completion_status === 'Completed' && e.score != null) {
          centerMap[key].scores.push(e.score);
        }
      }
    });
    const centerStats = Object.entries(centerMap).map(([name, data]) => ({
      name,
      count: data.count,
      avgScore: data.scores.length
        ? +(data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
        : 0,
      pct: +((data.count / enrollments.length) * 100).toFixed(0),
    }));

    // --- Region breakdown ---
    const regionMap = {};
    enrollments.forEach((e) => {
      const cityInfo = cities.find((c) => c.name === e.city);
      const region = cityInfo?.region || 'Unknown';
      if (!regionMap[region]) regionMap[region] = { region, count: 0, cities: new Set() };
      regionMap[region].count++;
      regionMap[region].cities.add(e.city);
    });
    const regionStats = Object.values(regionMap)
      .map((r) => ({ ...r, cityCount: r.cities.size }))
      .sort((a, b) => b.count - a.count);

    // --- KPIs ---
    const completedEnrollments = enrollments.filter((e) => e.completion_status === 'Completed');
    const allScores = completedEnrollments.filter((e) => e.score != null).map((e) => e.score);
    const kpis = {
      totalLeaders: leaders.length,
      totalCities: cities.length,
      totalEnrollments: enrollments.length,
      completionRate: +((completedEnrollments.length / enrollments.length) * 100).toFixed(0),
      avgScore: +(allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1),
      totalCompleted: completedEnrollments.length,
      totalInProgress: enrollments.length - completedEnrollments.length,
    };

    // --- Monthly enrollment timeline ---
    const monthMap = {};
    enrollments.forEach((e) => {
      if (e.start_date) {
        const month = e.start_date.slice(0, 7); // "2023-01"
        monthMap[month] = (monthMap[month] || 0) + 1;
      }
    });
    const timeline = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        const [y, m] = month.split('-');
        const label = new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        return { month, label, count };
      });

    return {
      leaders,
      cities,
      enrollments,
      cityStats,
      courseStats,
      centerStats,
      regionStats,
      kpis,
      timeline,
    };
  }, []);
}

import { useState, useEffect, useMemo } from 'react';
import staticData from '../data/enrollment_data.json';
import { isAirtableConfigured, fetchAirtableData } from './fetchAirtableData';

/**
 * Process raw data into computed metrics
 * This function is shared between static and live data modes
 */
function processEnrollmentData(rawData) {
  try {
    const { leaders, cities, enrollments } = rawData;

    // Validate data
    if (!Array.isArray(enrollments) || !Array.isArray(cities)) {
      throw new Error('Invalid data structure');
    }

    // --- City-level aggregation ---
    const cityMap = {};
    enrollments.forEach((e) => {
      // Skip enrollments with missing city
      if (!e.city || e.city === 'Unknown') return;
      
      if (!cityMap[e.city]) {
        const cityInfo = cities.find((c) => c.name === e.city) || {};
        cityMap[e.city] = {
          city: e.city,
          state: e.state || '',
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
  const allScores = completedEnrollments.filter((e) => e.score != null && !isNaN(e.score)).map((e) => e.score);
  
  // Handle cases where data might be incomplete (live Airtable data)
  const completionRate = enrollments.length > 0 
    ? +((completedEnrollments.length / enrollments.length) * 100).toFixed(0)
    : 0;
  
  const avgScore = allScores.length > 0
    ? +(allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : 0;
  
  const kpis = {
    totalLeaders: leaders.length,
    totalCities: cities.length,
    totalEnrollments: enrollments.length,
    completionRate,
    avgScore,
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
  } catch (err) {
    console.error('Error processing enrollment data:', err);
    // Return minimal safe structure
    return {
      leaders: [],
      cities: [],
      enrollments: [],
      cityStats: [],
      courseStats: [],
      centerStats: [],
      regionStats: [],
      kpis: { totalLeaders: 0, totalCities: 0, totalEnrollments: 0, completionRate: 0, avgScore: 0, totalCompleted: 0, totalInProgress: 0 },
      timeline: [],
    };
  }
}

/**
 * Hook to fetch and process enrollment data
 * Supports both static JSON (default) and live Airtable mode (optional)
 */
export function useEnrollmentData() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  
  const airtableEnabled = isAirtableConfigured();

  // Fetch live data on mount if Airtable is configured
  useEffect(() => {
    if (airtableEnabled) {
      loadLiveData();
    }
  }, [airtableEnabled]);

  const loadLiveData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAirtableData();
      setLiveData(data);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message);
      console.warn('Failed to load live data, using static fallback');
    } finally {
      setLoading(false);
    }
  };

  // Use live data if available, otherwise use static data
  const sourceData = liveData || staticData;
  
  const processedData = useMemo(() => processEnrollmentData(sourceData), [sourceData]);

  return {
    ...processedData,
    // Live data metadata - detect if data actually came from backend, not just hostname
    isLiveMode: liveData !== null && airtableEnabled,
    loading,
    error,
    lastRefreshed,
    refresh: loadLiveData,
  };
}

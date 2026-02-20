/**
 * fetchAirtableData.js — Fetch enrollment data from Vercel backend API
 * 
 * For live Airtable data, the frontend calls your Vercel serverless functions,
 * which securely handle API credentials on the server side.
 * No credentials are exposed in the client build.
 */

/**
 * Check if we should attempt to fetch from backend API
 * Always attempt (will fall back gracefully if unavailable)
 */
export function isAirtableConfigured() {
  // Always try to fetch from backend - it will gracefully fall back to static data if unavailable
  // This allows the dashboard to work on any host (GitHub Pages, Vercel, etc.)
  return true;
}

/**
 * Transform Airtable records to match the JSON structure
 */
function transformLeaders(records) {
  return records.map(record => ({
    record_id: record.fields['record_id'] || record.fields['Record ID'] || record.id || '',
    name: record.fields['Name'] || record.fields['name'] || '',
    email: record.fields['Email'] || record.fields['email'] || '',
    title: record.fields['Title'] || record.fields['title'] || '',
    tenure_start: record.fields['Tenure Start'] || record.fields['tenure_start'] || '',
    tenure_end: record.fields['Tenure End'] || record.fields['tenure_end'] || '',
    joined_date: record.fields['Joined Date'] || record.fields['joined_date'] || '',
  }));
}

function transformCities(records) {
  return records.map(record => ({
    name: record.fields['City Name'] || record.fields['name'] || '',
    state: record.fields['State'] || record.fields['state'] || '',
    population: record.fields['Population'] || record.fields['population'] || 0,
    region: record.fields['Region'] || record.fields['region'] || '',
    budget: record.fields['Budget'] || record.fields['budget'] || '',
  }));
}

function transformEnrollments(records, leaderMap = {}, cityMap = {}) {
  return records.map((record) => {
    let leaderName = '';
    const leaderIds = record.fields['Leader Name'];
    if (Array.isArray(leaderIds) && leaderIds.length > 0) {
      leaderName = leaderMap[leaderIds[0]] || leaderIds[0];
    }
    
    let cityName = '';
    const cityIds = record.fields['City'];
    if (Array.isArray(cityIds) && cityIds.length > 0) {
      cityName = cityMap[cityIds[0]] || cityIds[0];
    }
    
    return {
      record_id: record.fields['record_id'] || record.fields['Record ID'] || record.id || '',
      leader_name: leaderName || '',
      course_name: record.fields['Course Name'] || record.fields['course_name'] || '',
      duration_weeks: record.fields['Duration (Weeks)'] || record.fields['duration_weeks'] || 0,
      start_date: record.fields['Start Date'] || record.fields['start_date'] || '',
      end_date: record.fields['End Date'] || record.fields['end_date'] || null,
      city: cityName || '',
      state: record.fields['State'] || record.fields['state'] || '',
      program_center: record.fields['Program Center'] || record.fields['program_center'] || '',
      completion_status: record.fields['Status'] || record.fields['completion_status'] || '',
      score: record.fields['Score (%)'] || record.fields['score'] || null,
    };
  });
}

/**
 * Fetch from Vercel backend API (server-side credentials, no client exposure)
 */
async function fetchFromBackend() {
  try {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://jhu-enrollment.vercel.app';

    console.log('🔄 Fetching data from backend API...');

    const [leadersRes, citiesRes, enrollmentsRes] = await Promise.all([
      fetch(`${baseUrl}/api/leaders`),
      fetch(`${baseUrl}/api/cities`),
      fetch(`${baseUrl}/api/enrollments`),
    ]);

    if (!leadersRes.ok || !citiesRes.ok || !enrollmentsRes.ok) {
      throw new Error(`Backend returned ${leadersRes.status} / ${citiesRes.status} / ${enrollmentsRes.status}`);
    }

    const leadersData = await leadersRes.json();
    const citiesData = await citiesRes.json();
    const enrollmentsData = await enrollmentsRes.json();

    console.log('✅ Backend API data received');

    return {
      leaders: leadersData.records,
      cities: citiesData.records,
      enrollments: enrollmentsData.records,
    };
  } catch (error) {
    console.warn('⚠️ Backend API error:', error.message);
    return null;
  }
}

/**
 * Fetch enrollment data via backend API
 * Returns data in the same structure as enrollment_data.json
 */
export async function fetchAirtableData() {
  try {
    console.log('🔄 Fetching enrollment data...');
    
    const backendData = await fetchFromBackend();
    if (!backendData) {
      throw new Error('Backend API unavailable and no credentials configured for direct access');
    }

    const leadersRecords = backendData.leaders;
    const citiesRecords = backendData.cities;
    const enrollmentsRecords = backendData.enrollments;

    // Create maps for resolving linked record IDs
    const leaderMap = {};
    leadersRecords.forEach(record => {
      leaderMap[record.id] = record.fields['Name'] || 'Unknown';
    });

    const cityMap = {};
    citiesRecords.forEach(record => {
      cityMap[record.id] = record.fields['City'] || 'Unknown';
    });

    const data = {
      leaders: transformLeaders(leadersRecords),
      cities: transformCities(citiesRecords),
      enrollments: transformEnrollments(enrollmentsRecords, leaderMap, cityMap),
    };

    console.log('✅ Data loaded:', data.enrollments.length, 'enrollments');
    return data;
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    throw error;
  }
}

/**
 * Fetch data with automatic fallback to static JSON
 */
export async function fetchDataWithFallback(staticData) {
  if (!isAirtableConfigured()) {
    console.log('ℹ️ Using static JSON data (Airtable not configured)');
    return staticData;
  }

  try {
    return await fetchAirtableData();
  } catch (error) {
    console.warn('⚠️ Failed to fetch from backend, falling back to static data:', error.message);
    return staticData;
  }
}

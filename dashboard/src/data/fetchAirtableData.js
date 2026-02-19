/**
 * fetchAirtableData.js — Fetch enrollment data from Airtable (optional live mode)
 * 
 * This utility fetches data from Airtable when configured. If not configured,
 * the dashboard falls back to static JSON data (existing behavior).
 * 
 * Configuration (optional):
 * - Set VITE_AIRTABLE_PAT in .env.local
 * - Set VITE_AIRTABLE_BASE_ID in .env.local
 */

const AIRTABLE_API_URL = 'https://api.airtable.com/v0';

/**
 * Check if Airtable is configured
 */
export function isAirtableConfigured() {
  return !!(import.meta.env.VITE_AIRTABLE_PAT && import.meta.env.VITE_AIRTABLE_BASE_ID);
}

/**
 * Fetch all records from an Airtable table with pagination support
 */
async function fetchTableData(baseId, tableName, token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  let allRecords = [];
  let offset = null;

  do {
    const url = new URL(`${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(tableName)}`);
    if (offset) {
      url.searchParams.append('offset', offset);
    }

    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${tableName}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
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
  return records.map((record, index) => {
    // 'Leader Name' is a linked record field returning array of record IDs
    let leaderName = '';
    const leaderIds = record.fields['Leader Name'];
    if (Array.isArray(leaderIds) && leaderIds.length > 0) {
      leaderName = leaderMap[leaderIds[0]] || leaderIds[0];
    }
    
    // 'City' is a linked record field returning array of record IDs
    let cityName = '';
    const cityIds = record.fields['City'];
    if (Array.isArray(cityIds) && cityIds.length > 0) {
      // Resolve the city ID to city name using the map
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
 * Try to fetch from Vercel backend API (production)
 * Falls back to direct Airtable calls if backend unavailable
 */
async function fetchFromBackend() {
  try {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://jhu-enrollment.vercel.app';

    const [leadersRes, citiesRes, enrollmentsRes] = await Promise.all([
      fetch(`${baseUrl}/api/leaders`),
      fetch(`${baseUrl}/api/cities`),
      fetch(`${baseUrl}/api/enrollments`),
    ]);

    if (!leadersRes.ok || !citiesRes.ok || !enrollmentsRes.ok) {
      throw new Error('Backend API returned error');
    }

    const leadersData = await leadersRes.json();
    const citiesData = await citiesRes.json();
    const enrollmentsData = await enrollmentsRes.json();

    return {
      leaders: leadersData.records,
      cities: citiesData.records,
      enrollments: enrollmentsData.records,
    };
  } catch (error) {
    console.warn('⚠️ Backend API unavailable, falling back to direct Airtable calls:', error.message);
    return null;
  }
}

/**
 * Fetch all enrollment data from Airtable
 * Returns data in the same structure as enrollment_data.json
 */
export async function fetchAirtableData() {
  const token = import.meta.env.VITE_AIRTABLE_PAT;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;

  try {
    // First try the backend API (for production)
    console.log('🔄 Fetching data from backend API...');
    const backendData = await fetchFromBackend();
    if (backendData) {
      const leadersRecords = backendData.leaders;
      const citiesRecords = backendData.cities;
      const enrollmentsRecords = backendData.enrollments;
      console.log('✅ Data fetched from backend API');

      // Use backend data with same transformation logic below
      // (continue to transformation section with these records)
      const leaderMap = {};
      leadersRecords.forEach(record => {
        leaderMap[record.id] = record.fields['Name'] || record.fields['name'] || 'Unknown';
      });

      const cityMap = {};
      citiesRecords.forEach(record => {
        const cityName = record.fields['City'] || 'Unknown';
        cityMap[record.id] = cityName;
      });

      const data = {
        leaders: transformLeaders(leadersRecords),
        cities: transformCities(citiesRecords),
        enrollments: transformEnrollments(enrollmentsRecords, leaderMap, cityMap),
      };

      console.log('✅ Airtable data loaded:', data.enrollments.length, 'enrollments (via backend)');
      return data;
    }

    // Fallback to direct Airtable calls (local development)
    if (!token || !baseId) {
      throw new Error('Airtable credentials not configured. Set VITE_AIRTABLE_PAT and VITE_AIRTABLE_BASE_ID in .env.local');
    }

    console.log('🔄 Fetching data directly from Airtable...');

    // Fetch all tables in parallel
    const [leadersRecords, citiesRecords, enrollmentsRecords] = await Promise.all([
      fetchTableData(baseId, 'Leaders', token),
      fetchTableData(baseId, 'Cities', token),
      fetchTableData(baseId, 'Enrollments', token),
    ]);

    // Create a mapping of leader record ID to name for resolving linked records
    const leaderMap = {};
    leadersRecords.forEach(record => {
      leaderMap[record.id] = record.fields['Name'] || record.fields['name'] || 'Unknown';
    });

    // Create a mapping of city record ID to city name for resolving linked records
    const cityMap = {};
    citiesRecords.forEach(record => {
      // City field already contains the full city name, no need to append state
      const cityName = record.fields['City'] || 'Unknown';
      cityMap[record.id] = cityName;
    });

    // Transform to match JSON structure
    const data = {
      leaders: transformLeaders(leadersRecords),
      cities: transformCities(citiesRecords),
      enrollments: transformEnrollments(enrollmentsRecords, leaderMap, cityMap),
    };

    console.log('✅ Airtable data loaded:', data.enrollments.length, 'enrollments');

    return data;
  } catch (error) {
    console.error('❌ Error fetching Airtable data:', error.message);
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
    console.warn('⚠️ Failed to fetch from Airtable, falling back to static data:', error.message);
    return staticData;
  }
}

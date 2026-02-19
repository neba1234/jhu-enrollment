/**
 * Vercel Serverless Function: Fetch Cities from Airtable
 * 
 * Endpoint: /api/cities
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const PAT = process.env.AIRTABLE_PAT;

    if (!BASE_ID || !PAT) {
      return res.status(500).json({ error: 'Airtable credentials not configured' });
    }

    const headers = {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    };

    let allRecords = [];
    let offset = null;
    const tableName = 'Cities';

    do {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}${
        offset ? `?offset=${offset}` : ''
      }`;

      const response = await fetch(url, { headers });

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Airtable API error: ${response.statusText}`,
        });
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset;
    } while (offset);

    return res.status(200).json({ records: allRecords });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return res.status(500).json({ error: error.message });
  }
}

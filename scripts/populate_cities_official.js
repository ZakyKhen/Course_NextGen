const { Client } = require('pg');
const https = require('https');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

const RESOURCE_ID = '5c4c1c91-4977-4b72-8815-189f7f0df8a3';
const API_URL = `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=2000`;

function fetchCities() {
    return new Promise((resolve, reject) => {
        https.get(API_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const records = json.result.records;
                    // Extract name_he from the records
                    const cityNames = records.map(r => r['שם_ישוב'].trim()).filter(Boolean);
                    resolve(cityNames);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function updateDB() {
    try {
        console.log("Fetching cities from data.gov.il...");
        const cities = await fetchCities();
        console.log(`Fetched ${cities.length} cities.`);

        await client.connect();
        console.log("Connected to DB.");

        // Clear or prepare table
        await client.query('CREATE TABLE IF NOT EXISTS public.cities (id SERIAL PRIMARY KEY, city_he TEXT NOT NULL UNIQUE, city_en TEXT)');

        console.log("Inserting cities...");
        let count = 0;
        for (const city of cities) {
            try {
                await client.query('INSERT INTO public.cities (city_he) VALUES ($1) ON CONFLICT (city_he) DO NOTHING', [city]);
                count++;
            } catch (e) {
                // Ignore errors
            }
        }
        console.log(`Finished processing. Successfully ensured ${count} cities are in the DB.`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

updateDB();

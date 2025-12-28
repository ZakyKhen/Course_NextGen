const { Client } = require('pg');
const https = require('https');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

const RESOURCE_ID = 'b7cf8f14-64a2-4b33-8d4b-edb286fdbd37';
const API_URL = `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=3000`;

function fetchCities() {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        https.get(API_URL, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    console.log(`Status Code: ${res.statusCode}`);
                    if (res.statusCode !== 200) {
                        console.log("Raw Data Preview:", data.substring(0, 500));
                        reject(new Error(`API returned status ${res.statusCode}`));
                        return;
                    }

                    const json = JSON.parse(data);
                    if (!json.success) {
                        console.log("API returned success: false");
                        reject(new Error("API returned success: false"));
                        return;
                    }

                    const records = json.result.records;
                    // The field name for city name in Hebrew. Usually "שם_ישוב" or similar.
                    // Let's print the keys of the first record to be sure if we fail later.
                    if (records.length > 0) {
                        console.log("First record keys:", Object.keys(records[0]));
                    }

                    const cityNames = records.map(r => (r['שם_ישוב'] || r['שם ישוב'] || r['city_name_he'] || '').trim()).filter(Boolean);
                    resolve(cityNames);
                } catch (e) {
                    console.log("Raw Data (Error parsing):", data.substring(0, 200));
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

        await client.query('CREATE TABLE IF NOT EXISTS public.cities (id SERIAL PRIMARY KEY, city_he TEXT NOT NULL UNIQUE, city_en TEXT)');

        console.log("Inserting/Updating cities...");
        let count = 0;

        // Use a transaction or batch insert for speed? For now loop is fine for 1200 items.
        for (const city of cities) {
            // Clean the city name: remove excessive quotes, whitespace
            const cleanCity = city.replace(/['"]/g, '').trim();
            if (!cleanCity) continue;

            try {
                // Upsert logic
                await client.query(
                    'INSERT INTO public.cities (city_he) VALUES ($1) ON CONFLICT (city_he) DO NOTHING',
                    [cleanCity]
                );
                count++;
            } catch (e) {
                // console.error(`Failed to insert ${cleanCity}:`, e.message);
            }
            if (count % 100 === 0) process.stdout.write('.');
        }
        console.log(`\nFinished processing. Processed ${count} cities.`);

        // Final count check
        const res = await client.query('SELECT count(*) FROM public.cities');
        console.log("Total cities in DB after update:", res.rows[0].count);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

updateDB();

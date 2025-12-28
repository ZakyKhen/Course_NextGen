const { Client } = require('pg');
const https = require('https');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

const RESOURCE_ID = 'b7cf8f14-64a2-4b33-8d4b-edb286fdbd37';
const API_URL = `https://data.gov.il/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=5000`;

function fetchCities() {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        https.get(API_URL, options, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.success) {
                        reject(new Error("API success: false"));
                        return;
                    }
                    const records = json.result.records;
                    const cityNames = records.map(r => (r['שם_ישוב'] || r['שם ישוב'] || '').trim()).filter(Boolean);
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
        console.log("Fetching cities...");
        const cities = await fetchCities();
        console.log(`Fetched ${cities.length} cities.`);

        await client.connect();
        console.log("Connected to DB.");

        await client.query('CREATE TABLE IF NOT EXISTS public.cities (id SERIAL PRIMARY KEY, city_he TEXT NOT NULL UNIQUE, city_en TEXT)');

        console.log("Batch Inserting...");

        // Batch size
        const BATCH_SIZE = 100;
        let totalInserted = 0;

        for (let i = 0; i < cities.length; i += BATCH_SIZE) {
            const chunk = cities.slice(i, i + BATCH_SIZE);

            // Construct VALUES part: "('city1'), ('city2'), ..."
            const values = chunk
                .map(c => {
                    const clean = c.replace(/'/g, "''").replace(/\\/g, '\\\\').trim(); // Escape quotes
                    return clean ? `('${clean}')` : null;
                })
                .filter(Boolean)
                .join(', ');

            if (values) {
                const query = `INSERT INTO public.cities (city_he) VALUES ${values} ON CONFLICT (city_he) DO NOTHING`;
                await client.query(query);
                totalInserted += chunk.length;
                process.stdout.write('.');
            }
        }

        console.log(`\nFinished! Processed approx ${totalInserted} cities.`);

        const res = await client.query('SELECT count(*) FROM public.cities');
        console.log("Total cities in DB:", res.rows[0].count);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

updateDB();

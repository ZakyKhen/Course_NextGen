const { Client } = require('pg');
const assert = require('assert');

// Connection string – reuse same as other scripts
const connectionString = "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres";

async function runTests() {
    const client = new Client({ connectionString });
    await client.connect();
    try {
        // 1. Fetch all cities
        const { rows } = await client.query('SELECT city_he FROM public.cities');
        const cityNames = rows.map(r => r.city_he.trim());
        console.log(`Total cities in DB: ${cityNames.length}`);

        // Expect at least 1200 cities (the official dataset has ~1260)
        assert(cityNames.length >= 1200, `Expected at least 1200 cities, got ${cityNames.length}`);

        // Helper to check existence (case‑insensitive)
        const hasCity = (search) => cityNames.some(name => name.toLowerCase() === search.toLowerCase());

        // 2. Verify key cities exist
        const required = [
            'תל אביב - יפו', // official name
            'תל אביב',        // alias added earlier
            'תל מונד',
            'תל מון',
            'תל מון', // duplicate to ensure search works
        ];
        required.forEach(city => {
            assert(hasCity(city), `City missing: ${city}`);
        });

        console.log('All required cities are present and count is sufficient. ✅');
    } finally {
        await client.end();
    }
}

runTests().catch(err => {
    console.error('TEST FAILED:', err.message);
    process.exit(1);
});

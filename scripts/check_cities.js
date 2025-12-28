const { Client } = require('pg');
const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres",
    connectionTimeoutMillis: 5000
});

async function check() {
    try {
        await client.connect();
        console.log("Connection successful!");
        const res = await client.query('SELECT count(*) FROM public.cities');
        console.log("Current city count:", res.rows[0].count);
    } catch (err) {
        console.error("Connection failed:", err.message);
    } finally {
        await client.end();
    }
}

check();

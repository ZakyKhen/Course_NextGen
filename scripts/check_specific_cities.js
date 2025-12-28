const { Client } = require('pg');
const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

async function check() {
    try {
        await client.connect();
        const res = await client.query("SELECT * FROM public.cities WHERE city_he LIKE '%תל אביב%' OR city_he LIKE '%תל מונד%' LIMIT 10");
        console.log("Matches:", res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();

const { Client } = require('pg');
const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

async function check() {
    try {
        await client.connect();
        // Get all cities starting with "תל"
        const res = await client.query("SELECT id, city_he FROM public.cities WHERE city_he LIKE 'תל%' ORDER BY city_he");
        console.log("Cities starting with 'תל':", res.rows);

        // Check for 'Tel Aviv' specifically with loose matching
        const res2 = await client.query("SELECT id, city_he FROM public.cities WHERE city_he LIKE '%תל אביב%'");
        console.log("Cities containing 'תל אביב':", res2.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();

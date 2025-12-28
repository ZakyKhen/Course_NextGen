const { Client } = require('pg');
const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

async function addCommonAliases() {
    try {
        await client.connect();

        const aliases = [
            'תל אביב', // Common alias for תל אביב - יפו
            'תל מונד', // Missing city
            'תל מון',   // Possible variant
            'פתח תקווה', // Common alias (sometimes with dashes)
            'יהוד', // Common for Yehud-Monosson
            'מודיעין', // Common for Modiin-Maccabim-Reut
            'מעלות', // Maalot-Tarshiha
            'רמלה',
            'לוד',
            'נצרת',
            'חיפה',
            'ירושלים'
        ];

        for (const city of aliases) {
            try {
                // Try to insert simplified names. If they conflict (already exist), it's fine.
                await client.query(`INSERT INTO public.cities (city_he) VALUES ($1) ON CONFLICT (city_he) DO NOTHING`, [city]);
                console.log(`Ensured: ${city}`);
            } catch (e) {
                console.error(`Error with ${city}:`, e.message);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

addCommonAliases();

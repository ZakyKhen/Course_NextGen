const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

async function forcePromotion() {
    try {
        await client.connect();
        console.log("Connected to database.");

        // 1. מחפשים את המשתמש האחרון שנרשם (גם אם לא אישר מייל)
        const res = await client.query("SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;");

        if (res.rows.length === 0) {
            console.log("No users found in database.");
            return;
        }

        const user = res.rows[0];
        console.log(`Found user: ${user.email} (ID: ${user.id})`);

        // 2. אישור מייל כוחני
        await client.query("UPDATE auth.users SET email_confirmed_at = NOW(), last_sign_in_at = NOW() WHERE id = $1;", [user.id]);
        console.log("Email confirmed manually.");

        // 3. הפיכה לאדמין בטבלת הפרופילים
        await client.query(`
      INSERT INTO public.profiles (id, email, full_name, role, access_status)
      VALUES ($1, $2, 'Zaky Admin', 'admin', 'active')
      ON CONFLICT (id) DO UPDATE SET role = 'admin', access_status = 'active';
    `, [user.id, user.email]);

        console.log(`SUCCESS: ${user.email} is now a confirmed ADMIN.`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

forcePromotion();

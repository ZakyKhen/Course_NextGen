const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres';

async function resetPassword() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to database.');

        const email = 'ort.zaky@gmail.com';
        const newPassword = 'ZakyAdmin123!';

        // Note: We can't easily hash it here to match Supabase's bcrypt without dependencies.
        // However, we can check if the user exists and their status.

        const res = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log(`User ${email} not found. Please sign up first in the browser.`);
            return;
        }

        console.log(`User found with ID: ${res.rows[0].id}`);
        console.log('To reset the password, we recommend using the SignUp button in the browser');
        console.log('AFTER we fix the Supabase Key in src/lib/supabase.ts');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

resetPassword();

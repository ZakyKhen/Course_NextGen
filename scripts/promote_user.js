const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

async function findAndPromote() {
    try {
        await client.connect();
        console.log("Connected to database.");

        // 1. מחפשים את המשתמש החדש בטבלת ה-AUTH של סופהבייס
        const findRes = await client.query("SELECT id, email FROM auth.users WHERE email = 'ort.zakyt@gmail.com' LIMIT 1;");

        if (findRes.rows.length === 0) {
            console.log("User not found yet. Please make sure you signed up successfully at http://localhost:3000/login");
            return;
        }

        const userId = findRes.rows[0].id;
        console.log(`Found user: ${findRes.rows[0].email} with ID: ${userId}`);

        // 2. מאשרים את האימייל ידנית (כי לא שלחנו מייל אישור באמת)
        await client.query("UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = $1;", [userId]);
        console.log("Email confirmed manually.");

        // 3. הופכים את המשתמש ל-ADMIN ומאשרים גישה בטבלת ה-PROFILES
        const updateRes = await client.query(`
      UPDATE public.profiles 
      SET role = 'admin', access_status = 'active'
      WHERE id = $1
      RETURNING *;
    `, [userId]);

        if (updateRes.rows.length > 0) {
            console.log("SUCCESS: You are now an ADMIN!");
            console.log("Profile updated:", updateRes.rows[0]);
        } else {
            console.log("User found in Auth but not in Profiles yet. Checking trigger...");
            // במקרה והטריגר לא הספיק לפעול, ניצור את הפרופיל ידנית
            await client.query(`
        INSERT INTO public.profiles (id, email, full_name, role, access_status)
        VALUES ($1, 'ort.zakyt@gmail.com', 'Zaky', 'admin', 'active')
        ON CONFLICT (id) DO UPDATE SET role = 'admin', access_status = 'active';
      `, [userId]);
            console.log("Profile created/updated manually as ADMIN.");
        }

    } catch (err) {
        console.error("Error promoting user:", err);
    } finally {
        await client.end();
    }
}

findAndPromote();

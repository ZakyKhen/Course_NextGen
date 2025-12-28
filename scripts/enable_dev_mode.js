const { Client } = require('pg');

const connectionString = "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres";

async function openDevMode() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Connected to DB successfully.");

        const sql = `
            -- 1. נקה מדיניות ישנה
            DROP POLICY IF EXISTS "Full_Access_DEV_MODE" ON public.profiles;
            DROP POLICY IF EXISTS "Admin_Global_Access" ON public.profiles;
            DROP POLICY IF EXISTS "User_Self_Access" ON public.profiles;
            DROP POLICY IF EXISTS "Admins full access" ON public.profiles;
            DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;

            -- 2. פתח גישה מלאה לכולם (Dev Mode)
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Full_Access_DEV_MODE" ON public.profiles FOR ALL USING (true);

            -- 3. נקה נתוני דמה ישנים (רק אלו שנוצרו על ידי המערכת לבדיקה)
            DELETE FROM public.profiles WHERE id_number IS NULL AND email != 'ort.zaky@gmail.com';

            -- 4. הכנס נתוני דמה חדשים
            INSERT INTO public.profiles (id, email, full_name, role, access_status) VALUES 
            ('00000000-0000-0000-0000-000000000001', 'yossi@gmail.com', 'יוסי כהן', 'student', 'active'),
            ('00000000-0000-0000-0000-000000000002', 'sara@gmail.com', 'שרה לוי', 'student', 'pending_approval'),
            ('00000000-0000-0000-0000-000000000003', 'moshe@gmail.com', 'משה רבנו', 'teacher', 'active'),
            ('00000000-0000-0000-0000-000000000004', 'galit@gmail.com', 'גלית אשכול', 'student', 'denied'),
            ('00000000-0000-0000-0000-000000000005', 'test_admin@gmail.com', 'מנהל מערכת זמני', 'admin', 'active')
            ON CONFLICT DO NOTHING;

            -- 5. וודא שזכי הוא אדמין
            UPDATE public.profiles 
            SET role = 'admin', access_status = 'active' 
            WHERE email = 'ort.zaky@gmail.com';
        `;

        await client.query(sql);
        console.log("SUCCESS: DB is now in OPEN ACCESS mode with mock data.");

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        await client.end();
    }
}

openDevMode();

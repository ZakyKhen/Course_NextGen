const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

const sql = `
-- 1. טבלת מגדרים
CREATE TABLE IF NOT EXISTS public.genders (
    id SERIAL PRIMARY KEY,
    name_he TEXT NOT NULL UNIQUE,
    name_en TEXT
);

-- 2. טבלת הרחבות פרופיל
CREATE TABLE IF NOT EXISTS public.profile_extensions (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    bio TEXT,
    notes TEXT,
    github_url TEXT,
    emergency_phone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. הוספת עמודות חסרות לטבלת profiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='gender_id') THEN
        ALTER TABLE public.profiles ADD COLUMN gender_id INTEGER REFERENCES public.genders(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='address') THEN
        ALTER TABLE public.profiles ADD COLUMN address TEXT;
    END IF;
END $$;

-- 4. הכנסת נתונים בסיסיים
INSERT INTO public.genders (name_he, name_en) 
VALUES ('זכר', 'Male'), ('נקבה', 'Female'), ('אחר', 'Other'), ('לא מעוניין לציין', 'Prefer not to say')
ON CONFLICT (name_he) DO NOTHING;
`;

async function update() {
    try {
        await client.connect();
        console.log("Connected to Supabase Postgres.");
        await client.query(sql);
        console.log("Full Database Sync completed successfully!");
    } catch (err) {
        console.error("Error syncing database:", err);
    } finally {
        await client.end();
    }
}

update();

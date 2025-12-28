const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

async function createAdminViewsTable() {
    try {
        await client.connect();
        console.log('Connected to database...');

        // Create admin_saved_views table
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.admin_saved_views (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT,
                color TEXT,
                filters JSONB NOT NULL DEFAULT '{}'::jsonb,
                sorting JSONB NOT NULL DEFAULT '[]'::jsonb,
                is_default BOOLEAN DEFAULT false,
                is_public BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✅ Table admin_saved_views created successfully');

        // Create index for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_admin_saved_views_user_id 
            ON public.admin_saved_views(user_id);
        `);
        console.log('✅ Index created on user_id');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_admin_saved_views_is_public 
            ON public.admin_saved_views(is_public) 
            WHERE is_public = true;
        `);
        console.log('✅ Index created on is_public');

        // Create updated_at trigger function if it doesn't exist
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('✅ Trigger function created');

        // Create trigger to auto-update updated_at
        await client.query(`
            DROP TRIGGER IF EXISTS update_admin_saved_views_updated_at ON public.admin_saved_views;
            CREATE TRIGGER update_admin_saved_views_updated_at
            BEFORE UPDATE ON public.admin_saved_views
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        `);
        console.log('✅ Trigger created for updated_at');

        // Enable RLS
        await client.query(`
            ALTER TABLE public.admin_saved_views ENABLE ROW LEVEL SECURITY;
        `);
        console.log('✅ RLS enabled');

        // Create RLS policies
        // Policy 1: Users can view their own views
        await client.query(`
            DROP POLICY IF EXISTS "Users can view own views" ON public.admin_saved_views;
            CREATE POLICY "Users can view own views"
            ON public.admin_saved_views
            FOR SELECT
            USING (auth.uid() = user_id);
        `);
        console.log('✅ Policy created: Users can view own views');

        // Policy 2: Users can view public views
        await client.query(`
            DROP POLICY IF EXISTS "Users can view public views" ON public.admin_saved_views;
            CREATE POLICY "Users can view public views"
            ON public.admin_saved_views
            FOR SELECT
            USING (is_public = true);
        `);
        console.log('✅ Policy created: Users can view public views');

        // Policy 3: Users can insert their own views
        await client.query(`
            DROP POLICY IF EXISTS "Users can insert own views" ON public.admin_saved_views;
            CREATE POLICY "Users can insert own views"
            ON public.admin_saved_views
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        `);
        console.log('✅ Policy created: Users can insert own views');

        // Policy 4: Users can update their own views
        await client.query(`
            DROP POLICY IF EXISTS "Users can update own views" ON public.admin_saved_views;
            CREATE POLICY "Users can update own views"
            ON public.admin_saved_views
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        `);
        console.log('✅ Policy created: Users can update own views');

        // Policy 5: Users can delete their own views
        await client.query(`
            DROP POLICY IF EXISTS "Users can delete own views" ON public.admin_saved_views;
            CREATE POLICY "Users can delete own views"
            ON public.admin_saved_views
            FOR DELETE
            USING (auth.uid() = user_id);
        `);
        console.log('✅ Policy created: Users can delete own views');

        console.log('\n🎉 Admin saved views table setup completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createAdminViewsTable();

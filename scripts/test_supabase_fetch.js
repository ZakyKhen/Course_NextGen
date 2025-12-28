require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCityFetch() {
    console.log('Testing Supabase city fetch...');

    // Test 1: Default fetch
    const { data: d1, error: e1 } = await supabase.from('cities').select('*');
    console.log(`Test 1 (no limit): Got ${d1?.length || 0} cities`, e1 || '');

    // Test 2: With .limit(10000)
    const { data: d2, error: e2 } = await supabase.from('cities').select('*').limit(10000);
    console.log(`Test 2 (.limit(10000)): Got ${d2?.length || 0} cities`, e2 || '');

    // Test 3: With order and limit
    const { data: d3, error: e3 } = await supabase.from('cities').select('*').order('city_he').limit(10000);
    console.log(`Test 3 (.order + .limit(10000)): Got ${d3?.length || 0} cities`, e3 || '');

    // Test 4: Count
    const { count, error: e4 } = await supabase.from('cities').select('*', { count: 'exact', head: true });
    console.log(`Test 4 (count): ${count} cities`, e4 || '');
}

testCityFetch().catch(console.error);

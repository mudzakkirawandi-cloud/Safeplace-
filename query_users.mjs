import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, role')
    .in('role', ['peer_consultant', 'consultant', 'satgas'])
  
  if (error) console.error(error)
  else console.table(data)
}
run()

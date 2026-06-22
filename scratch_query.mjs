import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://btafefcorrfqcofsxshz.supabase.co';
const supabaseKey = 'sb_secret_sDSvoiq0BfX-EA03LLMq5A_e7fcCKBO';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      content,
      sender_id,
      created_at,
      reports!inner(tracking_code),
      users!messages_sender_id_fkey(full_name, role)
    `)
    .eq('reports.tracking_code', 'SK9SLS6N')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
  } else {
    fs.writeFileSync('query_output.json', JSON.stringify(data.map(d => ({
      tracking_code: d.reports?.tracking_code,
      content: d.content,
      sender_id: d.sender_id,
      created_at: d.created_at,
      full_name: d.users?.full_name,
      role: d.users?.role
    })), null, 2));
  }
}
run();

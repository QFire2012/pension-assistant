import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateForecast } from '@/lib/forecast';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const forecast = await generateForecast(user.id);
    return NextResponse.json(forecast);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

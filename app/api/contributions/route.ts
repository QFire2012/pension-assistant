import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_CONTRIBUTION_RUB = 1_000_000_000;
const MAX_NOTE_LENGTH = 240;

function isValidDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('user_id', user.id)
    .order('contributed_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_CONTRIBUTION_RUB) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const date = typeof body.date === 'string' && body.date
    ? body.date
    : new Date().toISOString().split('T')[0];
  if (!isValidDateOnly(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const note = typeof body.note === 'string' ? body.note.trim() : '';
  if (note.length > MAX_NOTE_LENGTH) {
    return NextResponse.json({ error: 'Note is too long' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('contributions')
    .insert({
      user_id: user.id,
      amount_cents: Math.round(amount * 100),
      contributed_at: date,
      note: note || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase
    .from('contributions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

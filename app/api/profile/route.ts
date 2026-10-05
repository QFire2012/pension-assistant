import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function finiteNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const currentAge = finiteNumber(body.current_age);
  const retirementAge = finiteNumber(body.retirement_age);
  const initialCapital = finiteNumber(body.initial_capital);
  const desiredMonthlyIncome = finiteNumber(body.desired_monthly_income);
  const returnRate = finiteNumber(body.real_return_rate);
  const inflationRate = finiteNumber(body.inflation_rate);
  const swrRate = body.swr_rate === null || body.swr_rate === undefined
    ? null
    : finiteNumber(body.swr_rate);
  const swrIsManual = Boolean(body.swr_is_manual);
  const portfolioStructure =
    typeof body.portfolio_structure === 'string' ? body.portfolio_structure : '';
  const [stocksPct, bondsPct] = portfolioStructure.split('_').map(Number);

  if (
    currentAge === null ||
    retirementAge === null ||
    initialCapital === null ||
    desiredMonthlyIncome === null ||
    returnRate === null ||
    inflationRate === null ||
    (swrIsManual && swrRate === null)
  ) {
    return NextResponse.json({ error: 'Invalid profile values' }, { status: 400 });
  }

  if (
    currentAge < 0 ||
    currentAge > 100 ||
    retirementAge <= currentAge ||
    retirementAge > 120 ||
    initialCapital < 0 ||
    desiredMonthlyIncome < 0 ||
    returnRate <= -0.99 ||
    returnRate > 1 ||
    inflationRate < 0 ||
    inflationRate > 1 ||
    (swrIsManual && (swrRate === null || swrRate < 0.02 || swrRate > 0.08)) ||
    !/^\d{1,3}_\d{1,3}$/.test(portfolioStructure) ||
    !Number.isFinite(stocksPct) ||
    !Number.isFinite(bondsPct) ||
    stocksPct < 0 ||
    bondsPct < 0 ||
    stocksPct + bondsPct !== 100
  ) {
    return NextResponse.json({ error: 'Profile values out of range' }, { status: 400 });
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      current_age: currentAge,
      retirement_age: retirementAge,
      initial_capital: initialCapital,
      desired_monthly_income: desiredMonthlyIncome,
      real_return_rate: returnRate,
      inflation_rate: inflationRate,
      swr_rate: swrIsManual ? swrRate : null,
      swr_is_manual: swrIsManual,
      portfolio_structure: portfolioStructure,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

import { createClient } from '@/lib/supabase/server';
import { splitOf, STOCKS_RETURN_20Y, BONDS_RETURN_20Y, AVG_INFLATION_20Y } from '@/lib/portfolio-data';

const SWR = 0.04;

const SHORT_MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const FULL_MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

function makeMonthLabels(startDate: Date, monthOffset: number) {
  const d = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, 1);
  const short = `${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const full = `${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return { short, full, year: d.getFullYear() };
}

export async function generateForecast(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', userId).single();
  if (!profile) throw new Error('Profile not found');

  const { data: contributions } = await supabase
    .from('contributions')
    .select('amount_cents, contributed_at')
    .eq('user_id', userId)
    .order('contributed_at', { ascending: true });

  const initialCapital = Number(profile.initial_capital || 0);
  const totalContributed =
    (contributions || []).reduce((s, c) => s + Number(c.amount_cents), 0) / 100;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recent = (contributions || []).filter(
    (c) => new Date(c.contributed_at) >= sixMonthsAgo
  );
  const avgMonthly =
    recent.length > 0
      ? recent.reduce((s, c) => s + Number(c.amount_cents), 0) / recent.length / 100
      : 0;

  const yearsToRetirement = profile.retirement_age - profile.current_age;
  const monthsToRetirement = yearsToRetirement * 12;
  const realAnnual = Number(profile.real_return_rate);
  const monthlyReturn = Math.pow(1 + realAnnual, 1 / 12) - 1;
  const inflationRate = Number(profile.inflation_rate || 0.05);

  const { stocksPct, bondsPct } = splitOf(profile.portfolio_structure || '60_40');
  const monthlyStocksReturn = Math.pow(1 + STOCKS_RETURN_20Y / 100, 1 / 12) - 1;
  const monthlyBondsReturn = Math.pow(1 + BONDS_RETURN_20Y / 100, 1 / 12) - 1;

  const gap = Number(profile.desired_monthly_income);
  const targetCapitalToday = gap > 0 ? (gap * 12) / SWR : 0;

  const startCapital = initialCapital + totalContributed;

  const fvStart = startCapital * Math.pow(1 + monthlyReturn, monthsToRetirement);
  const annuityFactor =
    monthlyReturn === 0
      ? monthsToRetirement
      : (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn;

  const requiredMonthlyToday = Math.max(
    0,
    (targetCapitalToday - fvStart) / (annuityFactor || 1)
  );

  let projectedToday = startCapital;
  for (let m = 0; m < monthsToRetirement; m++) {
    projectedToday = projectedToday * (1 + monthlyReturn) + avgMonthly;
  }

  const deficitToday = Math.max(0, targetCapitalToday - projectedToday);

  // Базовая дата — сегодня, первый день месяца
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);

  // ── Прогнозный график ──
  const projectionChart: any[] = [];
  const projectionChartMonthly: any[] = [];
  let capitalToday = startCapital;
  let investedToday = startCapital;
  const avgSalaryStart = 60000;

  // Годовой
  for (let y = 0; y <= yearsToRetirement; y++) {
    const inflationMult = Math.pow(1 + inflationRate, y);
    const dLabel = makeMonthLabels(startDate, y * 12);
    projectionChart.push({
      age: profile.current_age + y,
      year: y,
      yearLabel: String(dLabel.year),
      capitalToday: Math.round(capitalToday),
      investedToday: Math.round(investedToday),
      growthToday: Math.round(capitalToday - investedToday),
      targetToday: Math.round(targetCapitalToday),
      capitalNominal: Math.round(capitalToday * inflationMult),
      investedNominal: Math.round(investedToday * inflationMult),
      growthNominal: Math.round((capitalToday - investedToday) * inflationMult),
      targetNominal: Math.round(targetCapitalToday * inflationMult),
      inflationErosion: Math.round(capitalToday * inflationMult - capitalToday),
      requiredMonthlyThisYear: Math.round(requiredMonthlyToday * inflationMult),
      avgSalary: Math.round(avgSalaryStart * inflationMult),
    });
    for (let m = 0; m < 12; m++) {
      const contribution = requiredMonthlyToday * inflationMult;
      capitalToday = capitalToday * (1 + monthlyReturn) + contribution;
      investedToday += contribution;
    }
  }

  // Месячный
  capitalToday = startCapital;
  investedToday = startCapital;
  for (let m = 0; m <= monthsToRetirement; m++) {
    const yearsElapsed = m / 12;
    const inflationMult = Math.pow(1 + inflationRate, yearsElapsed);
    const labels = makeMonthLabels(startDate, m);
    projectionChartMonthly.push({
      age: +(profile.current_age + yearsElapsed).toFixed(2),
      month: m,
      monthLabel: labels.short,
      monthLabelFull: labels.full,
      yearLabel: String(labels.year),
      capitalToday: Math.round(capitalToday),
      investedToday: Math.round(investedToday),
      growthToday: Math.round(capitalToday - investedToday),
      targetToday: Math.round(targetCapitalToday),
      capitalNominal: Math.round(capitalToday * inflationMult),
      investedNominal: Math.round(investedToday * inflationMult),
      growthNominal: Math.round((capitalToday - investedToday) * inflationMult),
      targetNominal: Math.round(targetCapitalToday * inflationMult),
      inflationErosion: Math.round(capitalToday * inflationMult - capitalToday),
      requiredMonthlyThisYear: Math.round(requiredMonthlyToday * inflationMult),
      avgSalary: Math.round(avgSalaryStart * inflationMult),
    });
    if (m < monthsToRetirement) {
      const contribution = requiredMonthlyToday * inflationMult;
      capitalToday = capitalToday * (1 + monthlyReturn) + contribution;
      investedToday += contribution;
    }
  }

  const finalProjection = projectionChart[projectionChart.length - 1];

  // ── Реальные взносы ──
  const chartData: any[] = [];
  const chartDataMonthly: any[] = [];
  let totalCap = startCapital;
  let invested = startCapital;
  let stocksCap = startCapital * (stocksPct / 100);
  let bondsCap = startCapital * (bondsPct / 100);
  let stocksInvested = stocksCap;
  let bondsInvested = bondsCap;

  // Годовой
  for (let y = 0; y <= yearsToRetirement; y++) {
    const dLabel = makeMonthLabels(startDate, y * 12);
    chartData.push({
      age: profile.current_age + y,
      year: y,
      yearLabel: String(dLabel.year),
      capital: Math.round(totalCap),
      invested: Math.round(invested),
      growth: Math.round(totalCap - invested),
      stocksCapital: Math.round(stocksCap),
      bondsCapital: Math.round(bondsCap),
      stocksGrowth: Math.round(stocksCap - stocksInvested),
      bondsGrowth: Math.round(bondsCap - bondsInvested),
      target: Math.round(targetCapitalToday),
      avgSalary: Math.round(avgSalaryStart * Math.pow(1 + inflationRate, y)),
    });
    for (let m = 0; m < 12; m++) {
      const stocksPart = avgMonthly * (stocksPct / 100);
      const bondsPart = avgMonthly * (bondsPct / 100);
      stocksCap = stocksCap * (1 + monthlyStocksReturn) + stocksPart;
      bondsCap = bondsCap * (1 + monthlyBondsReturn) + bondsPart;
      stocksInvested += stocksPart;
      bondsInvested += bondsPart;
      totalCap = stocksCap + bondsCap;
      invested += avgMonthly;
    }
  }

  // Месячный
  totalCap = startCapital;
  invested = startCapital;
  stocksCap = startCapital * (stocksPct / 100);
  bondsCap = startCapital * (bondsPct / 100);
  stocksInvested = stocksCap;
  bondsInvested = bondsCap;
  for (let m = 0; m <= monthsToRetirement; m++) {
    const yearsElapsed = m / 12;
    const labels = makeMonthLabels(startDate, m);
    chartDataMonthly.push({
      age: +(profile.current_age + yearsElapsed).toFixed(2),
      month: m,
      monthLabel: labels.short,
      monthLabelFull: labels.full,
      yearLabel: String(labels.year),
      capital: Math.round(totalCap),
      invested: Math.round(invested),
      growth: Math.round(totalCap - invested),
      stocksCapital: Math.round(stocksCap),
      bondsCapital: Math.round(bondsCap),
      stocksGrowth: Math.round(stocksCap - stocksInvested),
      bondsGrowth: Math.round(bondsCap - bondsInvested),
      target: Math.round(targetCapitalToday),
      avgSalary: Math.round(avgSalaryStart * Math.pow(1 + inflationRate, yearsElapsed)),
    });
    if (m < monthsToRetirement) {
      const stocksPart = avgMonthly * (stocksPct / 100);
      const bondsPart = avgMonthly * (bondsPct / 100);
      stocksCap = stocksCap * (1 + monthlyStocksReturn) + stocksPart;
      bondsCap = bondsCap * (1 + monthlyBondsReturn) + bondsPart;
      stocksInvested += stocksPart;
      bondsInvested += bondsPart;
      totalCap = stocksCap + bondsCap;
      invested += avgMonthly;
    }
  }

  // ── Пост-пенсионная симуляция ──
  const postRetireYearsSimulate = 30;
  const postRetirement: any[] = [];
  let capPost = projectedToday;
  let cumulativeWithdrawn = 0;
  let cumulativeGrowth = 0;
  const monthlyWithdrawal = gap;
  let capitalRunOutAge: number | null = null;
  const monthlyWithdrawalInflation = 1 + inflationRate / 12;

  for (let y = 0; y <= postRetireYearsSimulate; y++) {
    postRetirement.push({
      age: profile.retirement_age + y,
      capital: Math.round(capPost),
      cumulativeWithdrawn: Math.round(cumulativeWithdrawn),
      cumulativeGrowth: Math.round(cumulativeGrowth),
      yearGrowth: 0,
      yearWithdrawal: 0,
    });
    const idx = postRetirement.length - 1;
    let yearGrowth = 0;
    let yearWithdrawal = 0;
    for (let m = 0; m < 12; m++) {
      const growth = capPost * monthlyReturn;
      const withdrawal = monthlyWithdrawal * Math.pow(monthlyWithdrawalInflation, y);
      yearGrowth += growth;
      yearWithdrawal += withdrawal;
      capPost = capPost + growth - withdrawal;
      cumulativeGrowth += growth;
      cumulativeWithdrawn += withdrawal;
      if (capPost <= 0) {
        capPost = 0;
        if (capitalRunOutAge === null) capitalRunOutAge = profile.retirement_age + y;
      }
    }
    postRetirement[idx].yearGrowth = Math.round(yearGrowth);
    postRetirement[idx].yearWithdrawal = Math.round(yearWithdrawal);
  }

  const safeMonthlyWithdrawal = (projectedToday * SWR) / 12;
  const desiredYearly = gap * 12;
  const withdrawalRatePct = projectedToday > 0 ? (desiredYearly / projectedToday) * 100 : 0;
  const swrPct = SWR * 100;
  const isWithdrawalSafe = withdrawalRatePct <= swrPct;
  const monthlyGap = Math.max(0, gap - safeMonthlyWithdrawal);
  const neededCapitalForDesired = gap > 0 ? (gap * 12) / SWR : 0;

  await supabase.from('forecast_snapshots').insert({
    user_id: userId,
    projected_capital_cents: Math.round(projectedToday * 100),
    required_monthly_cents: Math.round(requiredMonthlyToday * 100),
    deficit_cents: Math.round(deficitToday * 100),
  });

  return {
    initialCapital: Math.round(initialCapital),
    totalContributed: Math.round(totalContributed),
    startCapital: Math.round(startCapital),
    avgMonthlyContribution: Math.round(avgMonthly),
    projectedCapital: Math.round(projectedToday),
    targetCapital: Math.round(targetCapitalToday),
    deficit: Math.round(deficitToday),
    requiredMonthly: Math.round(requiredMonthlyToday),
    yearsToRetirement,
    stocksPct,
    bondsPct,
    currentAge: profile.current_age,
    retirementAge: profile.retirement_age,
    desiredMonthlyIncome: profile.desired_monthly_income,
    inflationPct: +(inflationRate * 100).toFixed(2),
    realAnnualReturnPct: +(realAnnual * 100).toFixed(2),

    projectionChart,
    projectionChartMonthly,
    requiredMonthlyThisYear: Math.round(requiredMonthlyToday),
    requiredMonthlyAtRetirement: finalProjection.requiredMonthlyThisYear,
    totalPersonalNominal: finalProjection.investedNominal,
    totalGrowthNominal: finalProjection.growthNominal,
    totalInflationErosion: finalProjection.inflationErosion,
    targetNominalAtRetirement: finalProjection.targetNominal,
    capitalNominalAtRetirement: finalProjection.capitalNominal,

    chartData,
    chartDataMonthly,

    postRetirement,
    capitalRunOutAge,
    safeMonthlyWithdrawal: Math.round(safeMonthlyWithdrawal),
    withdrawalRatePct: +withdrawalRatePct.toFixed(2),
    swrPct: +swrPct.toFixed(2),
    isWithdrawalSafe,
    monthlyGap: Math.round(monthlyGap),
    neededCapitalForDesired: Math.round(neededCapitalForDesired),
  };
}
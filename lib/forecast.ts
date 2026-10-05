import { createClient } from '@/lib/supabase/server';
import { splitOf, STOCKS_RETURN_20Y, BONDS_RETURN_20Y } from '@/lib/portfolio-data';
import type { ChartDatum } from '@/lib/types';

const SWR = 0.04;

const SHORT_MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const FULL_MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

type Profile = {
  current_age: number;
  retirement_age: number;
  initial_capital: number;
  desired_monthly_income: number;
  real_return_rate: number;
  inflation_rate: number;
  portfolio_structure: string;
};

type Contribution = {
  amount_cents: number;
  contributed_at: string;
};

function monthKey(value: string | Date) {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})/.exec(value);
    if (match) return `${match[1]}-${match[2]}`;
  }
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function averageMonthlyContribution(contributions: Contribution[], startDate: Date) {
  const windowStart = new Date(startDate);
  windowStart.setMonth(windowStart.getMonth() - 5);
  const minKey = monthKey(windowStart);
  const maxKey = monthKey(startDate);
  if (!minKey || !maxKey) return 0;

  const totalsByMonth = new Map<string, number>();
  for (const contribution of contributions) {
    const key = monthKey(contribution.contributed_at);
    if (!key || key < minKey || key > maxKey) continue;
    totalsByMonth.set(
      key,
      (totalsByMonth.get(key) || 0) + Number(contribution.amount_cents) / 100
    );
  }

  if (totalsByMonth.size === 0) return 0;
  const total = Array.from(totalsByMonth.values()).reduce((sum, amount) => sum + amount, 0);
  return total / totalsByMonth.size;
}

function makeMonthLabels(startDate: Date, monthOffset: number) {
  const d = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, 1);
  const short = `${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const full = `${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return { short, full, year: d.getFullYear() };
}

export async function generateForecast(userId: string) {
  const supabase = await createClient();

  const { data: profileData } = await supabase
    .from('profiles').select('*').eq('id', userId).single();
  const profile = profileData as Profile | null;
  if (!profile) throw new Error('Profile not found');

  const { data: contributionData } = await supabase
    .from('contributions')
    .select('amount_cents, contributed_at')
    .eq('user_id', userId)
    .order('contributed_at', { ascending: true });
  const contributions = (contributionData || []) as Contribution[];

  const initialCapital = Number(profile.initial_capital || 0);
  const totalContributed =
    (contributions || []).reduce((s, c) => s + Number(c.amount_cents), 0) / 100;

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const avgMonthly = averageMonthlyContribution(contributions, startDate);

  const yearsToRetirement = Math.max(0, profile.retirement_age - profile.current_age);
  const monthsToRetirement = yearsToRetirement * 12;
  const realAnnual = Number(profile.real_return_rate);
  const monthlyReturn = Math.pow(1 + realAnnual, 1 / 12) - 1;
  const inflationRate = Number(profile.inflation_rate || 0.05);

  const { stocksPct, bondsPct } = splitOf(profile.portfolio_structure || '60_40');
  const realStocksAnnual = (1 + STOCKS_RETURN_20Y / 100) / (1 + inflationRate) - 1;
  const realBondsAnnual = (1 + BONDS_RETURN_20Y / 100) / (1 + inflationRate) - 1;
  const monthlyStocksReturn = Math.pow(1 + realStocksAnnual, 1 / 12) - 1;
  const monthlyBondsReturn = Math.pow(1 + realBondsAnnual, 1 / 12) - 1;

  const gap = Number(profile.desired_monthly_income);
  const targetCapitalToday = gap > 0 ? (gap * 12) / SWR : 0;

  const startCapital = initialCapital + totalContributed;

  const fvStart = startCapital * Math.pow(1 + monthlyReturn, monthsToRetirement);
  const annuityFactor =
    monthlyReturn === 0
      ? monthsToRetirement
      : (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn;

  const requiredMonthlyToday = monthsToRetirement > 0
    ? Math.max(0, (targetCapitalToday - fvStart) / (annuityFactor || 1))
    : 0;

  // ── Прогноз с рекомендованными взносами ──
  // ВСЁ считаем в СЕГОДНЯШНИХ деньгах, номинал — только для вывода
  let projectedToday = startCapital;
  for (let m = 0; m < monthsToRetirement; m++) {
    projectedToday = projectedToday * (1 + monthlyReturn) + requiredMonthlyToday;
  }

  const deficitToday = Math.max(0, targetCapitalToday - projectedToday);

  // ── Прогнозный график ──
  const projectionChart: ChartDatum[] = [];
  const projectionChartMonthly: ChartDatum[] = [];
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
      capitalToday = capitalToday * (1 + monthlyReturn) + requiredMonthlyToday;
      investedToday += requiredMonthlyToday;
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
      capitalToday = capitalToday * (1 + monthlyReturn) + requiredMonthlyToday;
      investedToday += requiredMonthlyToday;
    }
  }

  const finalProjection = projectionChart[projectionChart.length - 1];

  // ── Реальные взносы (avgMonthly) ──
  const chartData: ChartDatum[] = [];
  const chartDataMonthly: ChartDatum[] = [];
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

  const currentProjectionFinal = chartDataMonthly[chartDataMonthly.length - 1];
  const currentProjectedToday = Number(currentProjectionFinal?.capital ?? startCapital);
  const currentDeficitToday = Math.max(0, targetCapitalToday - currentProjectedToday);

  // ── Пост-пенсионная симуляция ──
  // Капитал и снятия считаются в сегодняшних рублях. Инфляция уже вынесена в отдельные номинальные поля.
  const postRetireYearsSimulate = 30;
  const desiredYearly = gap * 12;
  const swrPct = SWR * 100;
  const neededCapitalForDesired = gap > 0 ? (gap * 12) / SWR : 0;
  const retirementAge = profile.retirement_age;

  function simulatePostRetirement(startCapitalToday: number) {
    const postRetirement: ChartDatum[] = [];
    let capPost = Math.max(0, startCapitalToday);
    let cumulativeWithdrawn = 0;
    let cumulativeGrowth = 0;
    let capitalRunOutAge: number | null = null;

    for (let y = 0; y <= postRetireYearsSimulate; y++) {
      postRetirement.push({
        age: retirementAge + y,
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
        const withdrawal = Math.min(gap, capPost + growth);
        yearGrowth += growth;
        yearWithdrawal += withdrawal;
        capPost = Math.max(0, capPost + growth - withdrawal);
        cumulativeGrowth += growth;
        cumulativeWithdrawn += withdrawal;
        if (capPost <= 0 && capitalRunOutAge === null) {
          capitalRunOutAge = retirementAge + y;
        }
      }
      postRetirement[idx].yearGrowth = Math.round(yearGrowth);
      postRetirement[idx].yearWithdrawal = Math.round(yearWithdrawal);
    }

    const safeMonthlyWithdrawal = (startCapitalToday * SWR) / 12;
    const withdrawalRatePct = startCapitalToday > 0 ? (desiredYearly / startCapitalToday) * 100 : 0;
    const isWithdrawalSafe = withdrawalRatePct <= swrPct;
    const monthlyGap = Math.max(0, gap - safeMonthlyWithdrawal);

    return {
      postRetirement,
      capitalRunOutAge,
      safeMonthlyWithdrawal,
      withdrawalRatePct,
      isWithdrawalSafe,
      monthlyGap,
    };
  }

  const recommendedRetirement = simulatePostRetirement(projectedToday);
  const currentRetirement = simulatePostRetirement(currentProjectedToday);

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
    currentProjectedCapital: Math.round(currentProjectedToday),
    targetCapital: Math.round(targetCapitalToday),
    deficit: Math.round(deficitToday),
    currentDeficit: Math.round(currentDeficitToday),
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

    postRetirement: recommendedRetirement.postRetirement,
    capitalRunOutAge: recommendedRetirement.capitalRunOutAge,
    safeMonthlyWithdrawal: Math.round(recommendedRetirement.safeMonthlyWithdrawal),
    withdrawalRatePct: +recommendedRetirement.withdrawalRatePct.toFixed(2),
    swrPct: +swrPct.toFixed(2),
    isWithdrawalSafe: recommendedRetirement.isWithdrawalSafe,
    monthlyGap: Math.round(recommendedRetirement.monthlyGap),
    neededCapitalForDesired: Math.round(neededCapitalForDesired),

    currentPostRetirement: currentRetirement.postRetirement,
    currentCapitalRunOutAge: currentRetirement.capitalRunOutAge,
    currentSafeMonthlyWithdrawal: Math.round(currentRetirement.safeMonthlyWithdrawal),
    currentWithdrawalRatePct: +currentRetirement.withdrawalRatePct.toFixed(2),
    currentIsWithdrawalSafe: currentRetirement.isWithdrawalSafe,
    currentMonthlyGap: Math.round(currentRetirement.monthlyGap),
  };
}

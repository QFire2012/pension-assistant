export async function fetchCBRKeyRate() {
  return { value: 16.0, date: new Date().toISOString().split('T')[0] };
}

export async function fetchMCFTRReturn() {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    const url = `https://iss.moex.com/iss/history/engines/stock/markets/index/securities.json?security=MCFTR&from=${startDate}&till=${endDate}`;
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.history?.data || [];
    if (rows.length < 2) return { value: 0.12, date: endDate };
    const first = rows[0];
    const last = rows[rows.length - 1];
    const firstClose = first[first.length - 1];
    const lastClose = last[last.length - 1];
    return { value: firstClose > 0 ? lastClose / firstClose - 1 : 0.12, date: endDate };
  } catch {
    return { value: 0.12, date: new Date().toISOString().split('T')[0] };
  }
}

export async function fetchInflation() {
  return { value: 0.075, date: new Date().toISOString().split('T')[0] };
}
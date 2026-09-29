export const formatMoney = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toFixed(2) + ' млрд ₽';
  if (abs >= 1e6) return (v / 1e6).toFixed(2) + ' млн ₽';
  return Math.round(v).toLocaleString('ru-RU') + ' ₽';
};
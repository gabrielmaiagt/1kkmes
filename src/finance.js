export const categories = ['Anúncios', 'BM', 'Domínio', 'Serviços', 'Outros'];
export const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
export function totals(entries) {
  const revenue = entries.filter(e => e.type === 'revenue').reduce((s,e) => s + e.amount, 0);
  const expenses = entries.filter(e => e.type === 'expense').reduce((s,e) => s + e.amount, 0);
  const ads = entries.filter(e => e.type === 'expense' && e.category === 'Anúncios').reduce((s,e) => s + e.amount, 0);
  return { revenue, expenses, profit: revenue - expenses, roas: ads ? revenue / ads : null };
}
export function parseAmount(value) {
  if (!/^\d+(,\d{1,2})?$/.test(value.trim())) return null;
  const amount = Math.round(Number(value.replace(',', '.')) * 100);
  return Number.isSafeInteger(amount) && amount > 0 && amount <= 100000000000 ? amount : null;
}
export const today = () => new Date().toLocaleDateString('en-CA');

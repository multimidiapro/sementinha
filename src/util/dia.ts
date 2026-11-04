// Datas no horário do aparelho, no formato AAAA-MM-DD.
export function chaveDia(data = new Date()) {
  const a = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

/** Os últimos `n` dias, do mais antigo para hoje. */
export function ultimosDias(n: number) {
  const dias: { chave: string; rotulo: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const rotulo = i === 0 ? 'Hoje' : data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    dias.push({ chave: chaveDia(data), rotulo });
  }
  return dias;
}

export function formatarMinutos(segundos: number) {
  const min = Math.round(segundos / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

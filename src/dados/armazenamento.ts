// Por enquanto os dados ficam só neste aparelho (localStorage).
// Na etapa do Supabase, este arquivo passa a falar com a conta dos pais; as telas não mudam.
import type { Dados } from '../tipos.ts';

const CHAVE = 'sementinha:v1';
export const VAZIO: Dados = { perfis: [], perfilAtivoId: null, progresso: {} };

export function lerDados(): Dados {
  try {
    const texto = localStorage.getItem(CHAVE);
    if (!texto) return VAZIO;
    const dados = JSON.parse(texto) as Partial<Dados>;
    return {
      perfis: Array.isArray(dados.perfis) ? dados.perfis : [],
      perfilAtivoId: typeof dados.perfilAtivoId === 'string' ? dados.perfilAtivoId : null,
      progresso: dados.progresso && typeof dados.progresso === 'object' ? dados.progresso : {},
    };
  } catch {
    return VAZIO;
  }
}

export function salvarDados(dados: Dados) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // Sem espaço ou modo privado: o app segue funcionando, só não lembra depois.
  }
}

export function apagarTudo() {
  localStorage.removeItem(CHAVE);
}

export function novoId() {
  return crypto.randomUUID();
}

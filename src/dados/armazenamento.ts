// Por enquanto os dados ficam só neste aparelho (localStorage).
// Na etapa do Supabase, este arquivo passa a falar com a conta dos pais; as telas não mudam.
import type { Dados } from '../tipos.ts';

const CHAVE = 'sementinha:v1';

export const VAZIO: Dados = {
  perfis: [],
  perfilAtivoId: null,
  progresso: {},
  videos: [],
  desligados: [],
  uso: {},
  extras: {},
  vistos: {},
};

const ehObjeto = (v: unknown): v is Record<string, never> => !!v && typeof v === 'object' && !Array.isArray(v);

export function lerDados(): Dados {
  try {
    const texto = localStorage.getItem(CHAVE);
    if (!texto) return VAZIO;
    const d = JSON.parse(texto) as Partial<Dados>;
    // Cada parte é conferida: dados de versões antigas do app continuam abrindo.
    return {
      perfis: Array.isArray(d.perfis) ? d.perfis : [],
      perfilAtivoId: typeof d.perfilAtivoId === 'string' ? d.perfilAtivoId : null,
      progresso: ehObjeto(d.progresso) ? d.progresso : {},
      videos: Array.isArray(d.videos) ? d.videos : [],
      desligados: Array.isArray(d.desligados) ? d.desligados : [],
      uso: ehObjeto(d.uso) ? d.uso : {},
      extras: ehObjeto(d.extras) ? d.extras : {},
      vistos: ehObjeto(d.vistos) ? d.vistos : {},
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

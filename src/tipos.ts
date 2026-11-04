// Da criança guardamos só isto: apelido, bichinho, limite de tempo, estrelinhas, progresso e tempo de uso.
// Nada de nome completo, foto, idade exata ou localização.
export type Perfil = {
  id: string;
  apelido: string;
  bichinho: string;
  minutosPorDia: number;
  estrelas: number;
};

/** Progresso de um item de um jogo (ex.: "vogais:a"). */
export type ProgressoItem = {
  acertos: number;
  erros: number;
  /** Acertos seguidos de primeira. Com 3 ou mais, conta como "já aprendeu". */
  seguidos: number;
};

export type Categoria = 'biblico' | 'educativo' | 'util';

/** Vídeo do YouTube escolhido pelos pais. Vale para todos os filhos. */
export type Video = {
  id: string;
  youtubeId: string;
  titulo: string;
  categoria: Categoria;
  ativo: boolean;
};

/** O que dá para ligar e desligar na salinha. */
export type AtividadeId = 'vogais' | 'cores' | 'videos';

/** Segundos de uso num dia: total e por atividade. */
export type UsoDia = { total: number } & Partial<Record<AtividadeId, number>>;

/** perfilId → chave → valor */
type PorPerfil<T> = Record<string, T>;

export type Dados = {
  perfis: Perfil[];
  perfilAtivoId: string | null;
  /** perfilId → "jogo:item" → progresso */
  progresso: PorPerfil<Record<string, ProgressoItem>>;
  videos: Video[];
  desligados: AtividadeId[];
  /** perfilId → "AAAA-MM-DD" → uso */
  uso: PorPerfil<Record<string, UsoDia>>;
  /** perfilId → "AAAA-MM-DD" → minutos extras liberados pelos pais */
  extras: PorPerfil<Record<string, number>>;
  /** perfilId → id do vídeo → vezes que assistiu */
  vistos: PorPerfil<Record<string, number>>;
};

export const APRENDIDO_COM = 3;

export const BICHINHOS = ['🐶', '🐱', '🐰', '🦁', '🐻', '🐼', '🦊', '🐸', '🐢', '🦋', '🐝', '🐞'];
export const OPCOES_MINUTOS = [15, 20, 30, 45, 60];

export const CATEGORIAS: Record<Categoria, { nome: string; icone: string }> = {
  biblico: { nome: 'Bíblicos', icone: '📖' },
  educativo: { nome: 'Educativos', icone: '🔤' },
  util: { nome: 'Úteis', icone: '🧼' },
};

export const NOMES_ATIVIDADES: Record<AtividadeId, string> = {
  vogais: 'Vogais',
  cores: 'Cores',
  videos: 'Vídeos',
};

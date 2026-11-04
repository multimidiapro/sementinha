// Da criança guardamos só isto: apelido, bichinho, limite de tempo, estrelinhas e o progresso nos jogos.
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

/** perfilId → "jogo:item" → progresso */
export type Progresso = Record<string, Record<string, ProgressoItem>>;

export type Dados = {
  perfis: Perfil[];
  perfilAtivoId: string | null;
  progresso: Progresso;
};

export const APRENDIDO_COM = 3;

export const BICHINHOS = ['🐶', '🐱', '🐰', '🦁', '🐻', '🐼', '🦊', '🐸', '🐢', '🦋', '🐝', '🐞'];
export const OPCOES_MINUTOS = [15, 20, 30, 45, 60];

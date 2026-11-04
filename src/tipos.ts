// Da criança guardamos só isto: apelido, bichinho, limite de tempo e estrelinhas.
// Nada de nome completo, foto, idade exata ou localização.
export type Perfil = {
  id: string;
  apelido: string;
  bichinho: string;
  minutosPorDia: number;
  estrelas: number;
};

export type Dados = {
  perfis: Perfil[];
  perfilAtivoId: string | null;
};

export const BICHINHOS = ['🐶', '🐱', '🐰', '🦁', '🐻', '🐼', '🦊', '🐸', '🐢', '🦋', '🐝', '🐞'];
export const OPCOES_MINUTOS = [15, 20, 30, 45, 60];

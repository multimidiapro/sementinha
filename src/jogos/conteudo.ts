// Conteúdo dos jogos. Para criar um jogo novo, basta uma lista assim.
//
// Texto da tela x texto falado: a voz do aparelho lê "O" sozinho como o artigo "o" (som de "u").
// Por isso o que é FALADO usa a pronúncia escrita: "á", "é", "i", "ó", "u" (com acento = som aberto).
export type ItemJogo = {
  id: string;
  pedido: string; // o que aparece escrito na tela ("Toque no O!")
  fala: string; // o que a voz fala para pedir ("Toque na letra ó!")
  nome: string; // o que a voz fala quando a criança toca nele por engano ("Essa é a letra ó.")
  reforco: string; // o que a voz fala quando acerta
  emoji: string; // desenho que aparece junto do reforço
  palavra: string; // palavra que aparece junto do desenho
  cor?: string; // só no jogo das cores
};

export type JogoId = 'vogais' | 'cores';

function vogal(id: string, som: string, palavra: string, emoji: string): ItemJogo {
  const letra = id.toUpperCase();
  return {
    id,
    pedido: `Toque no ${letra}!`,
    fala: `Toque na letra ${som}!`,
    nome: `Essa é a letra ${som}.`,
    reforco: `${som}... de ${palavra.toLowerCase()}!`,
    emoji,
    palavra,
  };
}

export const VOGAIS: ItemJogo[] = [
  vogal('a', 'á', 'Abelha', '🐝'),
  vogal('e', 'é', 'Elefante', '🐘'),
  vogal('i', 'i', 'Igreja', '⛪'),
  vogal('o', 'ó', 'Ovo', '🥚'),
  vogal('u', 'u', 'Uva', '🍇'),
];

function cor(id: string, palavra: string, comoO: string, emoji: string, hex: string): ItemJogo {
  return {
    id,
    pedido: `Toque no ${id}!`,
    fala: `Toque no ${id}!`,
    nome: `Esse é o ${id}.`,
    reforco: `${palavra}, como ${comoO}!`,
    emoji,
    palavra,
    cor: hex,
  };
}

export const CORES: ItemJogo[] = [
  cor('vermelho', 'Vermelho', 'o morango', '🍓', '#e24b4a'),
  cor('azul', 'Azul', 'o mar', '🌊', '#2f7fd6'),
  cor('amarelo', 'Amarelo', 'o sol', '🌞', '#f5c518'),
  cor('verde', 'Verde', 'a árvore', '🌳', '#4f9a1e'),
  cor('laranja', 'Laranja', 'a laranja', '🍊', '#f07d1a'),
  cor('roxo', 'Roxo', 'a uva', '🍇', '#7f4fc9'),
];

export const JOGOS: Record<JogoId, { titulo: string; itens: ItemJogo[] }> = {
  vogais: { titulo: 'Vogais', itens: VOGAIS },
  cores: { titulo: 'Cores', itens: CORES },
};

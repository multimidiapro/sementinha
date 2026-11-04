// Conteúdo dos jogos. Para criar um jogo novo, basta uma lista assim.
export type ItemJogo = {
  id: string;
  nome: string; // como o app chama o item ("o A", "o azul")
  pedido: string; // o que o app fala para pedir
  reforco: string; // o que o app fala quando acerta
  emoji: string; // desenho que aparece junto do reforço
  palavra: string; // palavra que aparece junto do desenho
  cor?: string; // só no jogo das cores
};

export type JogoId = 'vogais' | 'cores';

export const VOGAIS: ItemJogo[] = [
  { id: 'a', nome: 'o A', pedido: 'Toque no A!', reforco: 'A de abelha!', emoji: '🐝', palavra: 'Abelha' },
  { id: 'e', nome: 'o E', pedido: 'Toque no E!', reforco: 'E de elefante!', emoji: '🐘', palavra: 'Elefante' },
  { id: 'i', nome: 'o I', pedido: 'Toque no I!', reforco: 'I de igreja!', emoji: '⛪', palavra: 'Igreja' },
  { id: 'o', nome: 'o O', pedido: 'Toque no O!', reforco: 'O de ovo!', emoji: '🥚', palavra: 'Ovo' },
  { id: 'u', nome: 'o U', pedido: 'Toque no U!', reforco: 'U de uva!', emoji: '🍇', palavra: 'Uva' },
];

export const CORES: ItemJogo[] = [
  { id: 'vermelho', nome: 'o vermelho', pedido: 'Toque no vermelho!', reforco: 'Vermelho, como o morango!', emoji: '🍓', palavra: 'Vermelho', cor: '#e24b4a' },
  { id: 'azul', nome: 'o azul', pedido: 'Toque no azul!', reforco: 'Azul, como o mar!', emoji: '🌊', palavra: 'Azul', cor: '#2f7fd6' },
  { id: 'amarelo', nome: 'o amarelo', pedido: 'Toque no amarelo!', reforco: 'Amarelo, como o sol!', emoji: '🌞', palavra: 'Amarelo', cor: '#f5c518' },
  { id: 'verde', nome: 'o verde', pedido: 'Toque no verde!', reforco: 'Verde, como a árvore!', emoji: '🌳', palavra: 'Verde', cor: '#4f9a1e' },
  { id: 'laranja', nome: 'o laranja', pedido: 'Toque no laranja!', reforco: 'Laranja, como a laranja!', emoji: '🍊', palavra: 'Laranja', cor: '#f07d1a' },
  { id: 'roxo', nome: 'o roxo', pedido: 'Toque no roxo!', reforco: 'Roxo, como a uva!', emoji: '🍇', palavra: 'Roxo', cor: '#7f4fc9' },
];

export const JOGOS: Record<JogoId, { titulo: string; itens: ItemJogo[] }> = {
  vogais: { titulo: 'Vogais', itens: VOGAIS },
  cores: { titulo: 'Cores', itens: CORES },
};

// Conteúdo dos jogos de "toque no certo". Para criar um jogo novo, basta uma lista assim.
//
// Texto da tela x texto falado: a voz do aparelho lê "O" sozinho como o artigo "o" (som de "u").
// Por isso o que é FALADO usa a pronúncia escrita: "á", "é", "i", "ó", "u" (com acento = som aberto).
import { LETRAS, VOGAIS_LETRAS, letraDe, type Letra } from './letras.ts';

export type ItemJogo = {
  id: string;
  pedido: string; // o que aparece escrito na tela ("Toque no O!")
  fala: string; // o que a voz fala para pedir ("Toque na letra ó!")
  nome: string; // o que a voz fala quando a criança toca nele por engano ("Essa é a letra ó.")
  reforco: string; // o que a voz fala quando acerta
  emoji: string; // desenho que aparece junto do reforço
  palavra: string; // palavra que aparece junto do desenho
  rotulo?: string; // o que aparece escrito no botão (ex.: a letra). Sem rótulo, o botão é só a cor.
  cor?: string; // cor do botão (jogo das cores)
  figura?: string; // desenho grande em cima da pergunta (jogo do som inicial)
};

export type JogoId = 'vogais' | 'cores' | 'alfabeto' | 'som-inicial';

function letraParaTocar(l: Letra): ItemJogo {
  return {
    id: l.letra.toLowerCase(),
    pedido: `Toque no ${l.letra}!`,
    fala: `Toque na letra ${l.som}!`,
    nome: `Essa é a letra ${l.som}.`,
    reforco: letraDe(l),
    emoji: l.emoji,
    palavra: l.palavra,
    rotulo: l.letra,
  };
}

function somInicial(l: Letra): ItemJogo {
  const palavra = l.palavra.toLowerCase();
  return {
    id: l.letra.toLowerCase(),
    pedido: `Com qual letra começa ${l.palavra.toUpperCase()}?`,
    fala: `Com qual letra começa a palavra ${palavra}?`,
    nome: `Essa é a letra ${l.som}.`,
    reforco: `${l.palavra} começa com a letra ${l.som}!`,
    emoji: l.emoji,
    palavra: l.palavra,
    rotulo: l.letra,
    figura: l.emoji,
  };
}

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

export type DefinicaoJogo = { titulo: string; itens: ItemJogo[]; instrucao: string };

export const JOGOS: Record<JogoId, DefinicaoJogo> = {
  vogais: {
    titulo: 'Vogais',
    itens: VOGAIS_LETRAS.map(letraParaTocar),
    instrucao: 'Escute a letra que eu falar e toque nela!',
  },
  cores: {
    titulo: 'Cores',
    itens: CORES,
    instrucao: 'Escute a cor que eu falar e toque nela!',
  },
  alfabeto: {
    titulo: 'Desafio do alfabeto',
    // K, W e Y são raras para 4–5 anos: aparecem para explorar, mas não no desafio.
    itens: LETRAS.filter((l) => !'KWY'.includes(l.letra)).map(letraParaTocar),
    instrucao: 'Escute a letra que eu falar e toque nela!',
  },
  'som-inicial': {
    titulo: 'Som inicial',
    itens: LETRAS.filter((l) => l.inicioClaro).map(somInicial),
    instrucao: 'Olhe o desenho, escute a palavra e toque na letra que começa ela!',
  },
};

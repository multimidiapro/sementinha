// O alfabeto do Sementinha: nome falado de cada letra, uma palavra e um desenho.
//
// "som" é como a VOZ deve dizer o nome da letra (escrito do jeito que se fala),
// porque a voz do aparelho lê "O" sozinho como "u", "R" como "r" etc.
// "inicioClaro": a palavra começa com o som da letra (H de hipopótamo é mudo, por isso fica de fora
// do jogo "Som Inicial").

export type Letra = {
  letra: string;
  som: string;
  palavra: string;
  emoji: string;
  inicioClaro: boolean;
};

export const LETRAS: Letra[] = [
  { letra: 'A', som: 'á', palavra: 'Abelha', emoji: '🐝', inicioClaro: true },
  { letra: 'B', som: 'bê', palavra: 'Bola', emoji: '⚽', inicioClaro: true },
  { letra: 'C', som: 'cê', palavra: 'Casa', emoji: '🏠', inicioClaro: true },
  { letra: 'D', som: 'dê', palavra: 'Dado', emoji: '🎲', inicioClaro: true },
  { letra: 'E', som: 'é', palavra: 'Elefante', emoji: '🐘', inicioClaro: true },
  { letra: 'F', som: 'éfe', palavra: 'Foca', emoji: '🦭', inicioClaro: true },
  { letra: 'G', som: 'gê', palavra: 'Gato', emoji: '🐱', inicioClaro: true },
  { letra: 'H', som: 'agá', palavra: 'Hipopótamo', emoji: '🦛', inicioClaro: false },
  { letra: 'I', som: 'i', palavra: 'Igreja', emoji: '⛪', inicioClaro: true },
  { letra: 'J', som: 'jóta', palavra: 'Jacaré', emoji: '🐊', inicioClaro: true },
  { letra: 'K', som: 'cá', palavra: 'Kiwi', emoji: '🥝', inicioClaro: false },
  { letra: 'L', som: 'éle', palavra: 'Leão', emoji: '🦁', inicioClaro: true },
  { letra: 'M', som: 'ême', palavra: 'Macaco', emoji: '🐒', inicioClaro: true },
  { letra: 'N', som: 'êne', palavra: 'Navio', emoji: '🚢', inicioClaro: true },
  { letra: 'O', som: 'ó', palavra: 'Ovo', emoji: '🥚', inicioClaro: true },
  { letra: 'P', som: 'pê', palavra: 'Pato', emoji: '🦆', inicioClaro: true },
  { letra: 'Q', som: 'quê', palavra: 'Queijo', emoji: '🧀', inicioClaro: true },
  { letra: 'R', som: 'érre', palavra: 'Rato', emoji: '🐭', inicioClaro: true },
  { letra: 'S', som: 'ésse', palavra: 'Sapo', emoji: '🐸', inicioClaro: true },
  { letra: 'T', som: 'tê', palavra: 'Tomate', emoji: '🍅', inicioClaro: true },
  { letra: 'U', som: 'u', palavra: 'Uva', emoji: '🍇', inicioClaro: true },
  { letra: 'V', som: 'vê', palavra: 'Vaca', emoji: '🐄', inicioClaro: true },
  { letra: 'W', som: 'dáblio', palavra: 'Waffle', emoji: '🧇', inicioClaro: false },
  { letra: 'X', som: 'xis', palavra: 'Xícara', emoji: '☕', inicioClaro: true },
  { letra: 'Y', som: 'ípsilon', palavra: 'Yakisoba', emoji: '🍜', inicioClaro: false },
  { letra: 'Z', som: 'zê', palavra: 'Zebra', emoji: '🦓', inicioClaro: true },
];

export const VOGAIS_LETRAS = LETRAS.filter((l) => 'AEIOU'.includes(l.letra));

/** Cores fixas para cada letra no alfabeto (alegre, mas sempre a mesma cor para a mesma letra). */
const CORES_LETRAS = ['#e24b4a', '#ef9f27', '#4f9a1e', '#2f7fd6', '#7f4fc9', '#d4537e', '#1d9e75'];
export function corDaLetra(letra: string) {
  return CORES_LETRAS[(letra.charCodeAt(0) - 65) % CORES_LETRAS.length];
}

/** "á... de abelha!" */
export function letraDe(l: Letra) {
  return `${l.som}... de ${l.palavra.toLowerCase()}!`;
}

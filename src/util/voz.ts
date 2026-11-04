// O app fala usando a voz do próprio aparelho. Nada sai do aparelho.
//
// Para a fala não ser cortada no meio:
// 1. Por padrão uma fala ESPERA a anterior terminar (fila). Só corta quem pede `interromper`
//    (ex.: a criança tocou de novo, ou pediu para repetir).
// 2. Cada fala fica guardada numa lista até terminar: alguns navegadores jogam fora uma fala
//    "esquecida" e ela para no meio.
// 3. Um pontinho no fim: algumas vozes engolem o último pedacinho da frase.

let vozEscolhida: SpeechSynthesisVoice | null = null;
const falando = new Set<SpeechSynthesisUtterance>();

function escolherVoz() {
  if (!('speechSynthesis' in window)) return null;
  const vozes = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('pt'));
  vozEscolhida = vozes.find((v) => v.lang === 'pt-BR' && v.localService) ?? vozes.find((v) => v.lang === 'pt-BR') ?? vozes[0] ?? null;
  return vozEscolhida;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.addEventListener?.('voiceschanged', escolherVoz);
}

/** Fala o texto. A promessa termina quando a fala acaba (ou é cortada). */
export function falar(texto: string, { interromper = false } = {}): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  if (interromper) parar();

  const fala = new SpeechSynthesisUtterance(`${texto} .`);
  fala.lang = 'pt-BR';
  fala.rate = 0.9;
  fala.pitch = 1.15;
  const voz = vozEscolhida ?? escolherVoz();
  if (voz) fala.voice = voz;

  return new Promise((resolve) => {
    // Se o aparelho nunca avisar que acabou, segue mesmo assim (tempo estimado pelo tamanho do texto).
    const reserva = window.setTimeout(acabou, 1500 + texto.length * 110);
    function acabou() {
      window.clearTimeout(reserva);
      falando.delete(fala);
      resolve();
    }
    fala.onend = acabou;
    fala.onerror = acabou;
    falando.add(fala);
    speechSynthesis.speak(fala);
  });
}

/** Corta tudo o que está falando ou esperando para falar. */
export function parar() {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  falando.clear();
}

/** Já tem fala tocando ou na fila? */
export function estaFalando() {
  return 'speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending);
}

// O app fala usando a voz do próprio aparelho. Nada sai do aparelho.
let vozEscolhida: SpeechSynthesisVoice | null = null;

function escolherVoz() {
  if (!('speechSynthesis' in window)) return null;
  const vozes = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('pt'));
  vozEscolhida = vozes.find((v) => v.lang === 'pt-BR' && v.localService) ?? vozes.find((v) => v.lang === 'pt-BR') ?? vozes[0] ?? null;
  return vozEscolhida;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynthesis.addEventListener?.('voiceschanged', escolherVoz);
}

export function falar(texto: string) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 0.9;
  fala.pitch = 1.15;
  const voz = vozEscolhida ?? escolherVoz();
  if (voz) fala.voice = voz;
  speechSynthesis.speak(fala);
}

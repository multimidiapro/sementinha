// Salinha trancada: tela cheia, botão "voltar" não sai, sem menu de toque longo.
// O site sozinho não bloqueia o botão "início" do aparelho: para isso, "Fixar app" (Android) ou "Acesso Guiado" (iPhone).

export function entrarTelaCheia() {
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  try {
    if (el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    else el.webkitRequestFullscreen?.();
  } catch {
    // Alguns aparelhos (iPhone) não deixam: segue sem tela cheia.
  }
}

export function sairTelaCheia() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

/** Liga a trava. Devolve a função que desliga. */
export function travarSalinha() {
  const segurarVoltar = () => history.pushState({ salinha: true }, '');
  const bloquear = (e: Event) => e.preventDefault();
  const avisarAntesDeSair = (e: BeforeUnloadEvent) => e.preventDefault();

  segurarVoltar();
  window.addEventListener('popstate', segurarVoltar);
  window.addEventListener('contextmenu', bloquear);
  window.addEventListener('beforeunload', avisarAntesDeSair);

  return () => {
    window.removeEventListener('popstate', segurarVoltar);
    window.removeEventListener('contextmenu', bloquear);
    window.removeEventListener('beforeunload', avisarAntesDeSair);
  };
}

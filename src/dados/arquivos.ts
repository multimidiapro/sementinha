// Vídeos próprios ficam guardados no próprio aparelho (IndexedDB), para tocar sem internet.
// Nada sai do aparelho. A lista (título, categoria) fica junto com o resto dos dados.

const BANCO = 'sementinha-arquivos';
const VIDEOS = 'videos';
const MINIATURAS = 'miniaturas';

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, 1);
    pedido.onupgradeneeded = () => {
      const db = pedido.result;
      if (!db.objectStoreNames.contains(VIDEOS)) db.createObjectStore(VIDEOS);
      if (!db.objectStoreNames.contains(MINIATURAS)) db.createObjectStore(MINIATURAS);
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function transacao<T>(lojas: string[], modo: IDBTransactionMode, trabalho: (t: IDBTransaction) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const t = db.transaction(lojas, modo);
    const pedido = trabalho(t);
    t.oncomplete = () => resolve(pedido ? pedido.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error ?? new Error('Sem espaço no aparelho'));
  });
}

export async function guardarArquivo(id: string, video: Blob, miniatura: Blob | null) {
  // Pede ao navegador para não apagar os vídeos quando o aparelho ficar sem espaço.
  navigator.storage?.persist?.().catch(() => {});
  await transacao([VIDEOS, MINIATURAS], 'readwrite', (t) => {
    t.objectStore(VIDEOS).put(video, id);
    if (miniatura) t.objectStore(MINIATURAS).put(miniatura, id);
  });
}

export function lerVideo(id: string) {
  return transacao<Blob>([VIDEOS], 'readonly', (t) => t.objectStore(VIDEOS).get(id));
}

export function lerMiniatura(id: string) {
  return transacao<Blob>([MINIATURAS], 'readonly', (t) => t.objectStore(MINIATURAS).get(id));
}

export async function apagarArquivo(id: string) {
  await transacao([VIDEOS, MINIATURAS], 'readwrite', (t) => {
    t.objectStore(VIDEOS).delete(id);
    t.objectStore(MINIATURAS).delete(id);
  });
}

export async function apagarTodosArquivos() {
  await transacao([VIDEOS, MINIATURAS], 'readwrite', (t) => {
    t.objectStore(VIDEOS).clear();
    t.objectStore(MINIATURAS).clear();
  });
}

/** Quanto o app já usa e quanto ainda cabe no aparelho (em bytes). */
export async function espaco() {
  const e = await navigator.storage?.estimate?.();
  return { usado: e?.usage ?? 0, total: e?.quota ?? 0 };
}

export function formatarBytes(b: number) {
  if (b >= 1e9) return `${(b / 1e9).toFixed(1).replace('.', ',')} GB`;
  return `${Math.round(b / 1e6)} MB`;
}

/** Tira uma foto do vídeo (perto de 1 segundo) para a galeria e descobre a duração. */
export function prepararVideo(arquivo: File): Promise<{ miniatura: Blob | null; duracao: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(arquivo);
    const v = document.createElement('video');
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.src = url;
    let terminou = false;
    const fim = (miniatura: Blob | null) => {
      if (terminou) return;
      terminou = true;
      URL.revokeObjectURL(url);
      resolve({ miniatura, duracao: Number.isFinite(v.duration) ? Math.round(v.duration) : 0 });
    };
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(1, (v.duration || 2) / 2);
    };
    v.onseeked = () => {
      const largura = 480;
      const altura = Math.round((v.videoHeight / v.videoWidth) * largura) || 270;
      const tela = document.createElement('canvas');
      tela.width = largura;
      tela.height = altura;
      tela.getContext('2d')?.drawImage(v, 0, 0, largura, altura);
      tela.toBlob((b) => fim(b), 'image/jpeg', 0.8);
    };
    v.onerror = () => fim(null);
    setTimeout(() => fim(null), 8000);
  });
}

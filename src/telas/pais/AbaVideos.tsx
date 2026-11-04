import { useEffect, useState, type FormEvent } from 'react';
import { CATEGORIAS, type Categoria, type Video } from '../../tipos.ts';
import { buscarTitulo, extrairIdYoutube, miniatura } from '../../util/youtube.ts';
import type { AcoesPais } from './PainelPais.tsx';
import { Cartao, Interruptor, Pilulas, confirmar } from './ui.tsx';

const OPCOES_CATEGORIA = (Object.keys(CATEGORIAS) as Categoria[]).map((c) => ({
  valor: c,
  rotulo: `${CATEGORIAS[c].icone} ${CATEGORIAS[c].nome}`,
}));

export function AbaVideos({ videos, acoes }: { videos: Video[]; acoes: AcoesPais }) {
  return (
    <>
      <Cartao titulo="Adicionar vídeo">
        <FormVideo videos={videos} acoes={acoes} />
      </Cartao>

      {videos.length === 0 ? (
        <p className="text-center text-sm text-slate-500">
          Nenhum vídeo ainda. Enquanto a lista estiver vazia, o botão "Vídeos" não aparece para a criança.
        </p>
      ) : (
        (Object.keys(CATEGORIAS) as Categoria[]).map((c) => {
          const lista = videos.filter((v) => v.categoria === c);
          if (!lista.length) return null;
          return (
            <Cartao key={c} titulo={`${CATEGORIAS[c].icone} ${CATEGORIAS[c].nome} (${lista.length})`}>
              <ul className="space-y-3">
                {lista.map((v) => (
                  <li key={v.id} className="flex items-center gap-3">
                    <img src={miniatura(v.youtubeId)} alt="" className={`h-14 w-24 shrink-0 rounded-lg object-cover ${v.ativo ? '' : 'opacity-40 grayscale'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">{v.titulo}</p>
                      <button
                        onClick={() => confirmar(`Remover "${v.titulo}"?`) && acoes.removerVideo(v.id)}
                        className="text-xs text-slate-500 underline"
                      >
                        Remover
                      </button>
                    </div>
                    <Interruptor ligado={v.ativo} aoMudar={() => acoes.alternarVideo(v.id)} rotulo={`Mostrar "${v.titulo}" para a criança`} />
                  </li>
                ))}
              </ul>
            </Cartao>
          );
        })
      )}
    </>
  );
}

function FormVideo({ videos, acoes }: { videos: Video[]; acoes: AcoesPais }) {
  const [link, setLink] = useState('');
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('biblico');
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');

  const youtubeId = extrairIdYoutube(link);
  const repetido = youtubeId ? videos.some((v) => v.youtubeId === youtubeId) : false;

  // Colou um link válido: busca o título sozinho (dá para mudar depois).
  useEffect(() => {
    if (!youtubeId) return;
    let cancelado = false;
    setBuscando(true);
    buscarTitulo(youtubeId).then((t) => {
      if (cancelado) return;
      setBuscando(false);
      if (t) setTitulo(t);
      else setErro('Não achei o título. Escreva um você mesmo. Se o vídeo não abrir depois, ele não permite ser mostrado fora do YouTube.');
    });
    return () => {
      cancelado = true;
    };
  }, [youtubeId]);

  function salvar(e: FormEvent) {
    e.preventDefault();
    if (!youtubeId) return setErro('Cole um link do YouTube, como youtube.com/watch?v=… ou youtu.be/…');
    if (repetido) return setErro('Esse vídeo já está na lista.');
    const limpo = titulo.trim();
    if (!limpo) return setErro('Escreva um título.');
    acoes.adicionarVideo({ youtubeId, titulo: limpo.slice(0, 120), categoria });
    setLink('');
    setTitulo('');
    setErro('');
  }

  return (
    <form onSubmit={salvar} className="space-y-4">
      <label className="block text-sm font-semibold">
        Link do YouTube
        <input
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setTitulo('');
            setErro('');
          }}
          inputMode="url"
          placeholder="https://youtu.be/…"
          className="mt-1 block w-full rounded-xl bg-slate-50 px-3 py-3 text-base font-normal ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-folha"
        />
      </label>

      {youtubeId && (
        <div className="flex items-start gap-3">
          <img src={miniatura(youtubeId)} alt="" className="h-20 w-36 shrink-0 rounded-lg object-cover" />
          <label className="block flex-1 text-sm font-semibold">
            Título {buscando && <span className="font-normal text-slate-400">(buscando…)</span>}
            <input
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setErro('');
              }}
              maxLength={120}
              className="mt-1 block w-full rounded-xl bg-slate-50 px-3 py-2 text-sm font-normal ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-folha"
            />
          </label>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold">Tipo</p>
        <Pilulas opcoes={OPCOES_CATEGORIA} valor={categoria} aoMudar={setCategoria} />
      </div>

      {(erro || repetido) && <p className="text-sm text-red-600">{repetido ? 'Esse vídeo já está na lista.' : erro}</p>}

      <button type="submit" className="w-full rounded-xl bg-folha py-3 text-base font-bold text-white active:bg-folha-escura">
        Adicionar
      </button>
      <p className="text-xs text-slate-500">
        A criança vê só os vídeos desta lista, sem anúncios do app e sem sugestões no final. Assista antes de adicionar.
      </p>
    </form>
  );
}

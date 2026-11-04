import { useEffect, useState, type FormEvent } from 'react';
import { Miniatura } from '../../componentes/Miniatura.tsx';
import { espaco, formatarBytes, guardarArquivo, prepararVideo } from '../../dados/arquivos.ts';
import { novoId } from '../../dados/armazenamento.ts';
import { CATEGORIAS, type Categoria, type Video } from '../../tipos.ts';
import { buscarTitulo, extrairIdYoutube, miniatura } from '../../util/youtube.ts';
import type { AcoesPais } from './PainelPais.tsx';
import { Cartao, Interruptor, Pilulas, confirmar } from './ui.tsx';

const OPCOES_CATEGORIA = (Object.keys(CATEGORIAS) as Categoria[]).map((c) => ({
  valor: c,
  rotulo: `${CATEGORIAS[c].icone} ${CATEGORIAS[c].nome}`,
}));

type Origem = Video['origem'];

const CAMPO =
  'mt-1 block w-full rounded-xl bg-slate-50 px-3 py-3 text-base font-normal ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-folha';

export function AbaVideos({ videos, acoes }: { videos: Video[]; acoes: AcoesPais }) {
  const [origem, setOrigem] = useState<Origem>('arquivo');

  return (
    <>
      <Cartao titulo="Adicionar vídeo">
        <Pilulas
          opcoes={[
            { valor: 'arquivo', rotulo: '📱 Do aparelho · funciona sem internet' },
            { valor: 'youtube', rotulo: '▶️ Do YouTube · só com internet' },
          ]}
          valor={origem}
          aoMudar={setOrigem}
        />
        <div className="mt-4">
          {origem === 'arquivo' ? <FormArquivo acoes={acoes} /> : <FormYoutube videos={videos} acoes={acoes} />}
        </div>
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
                    <Miniatura video={v} className={`h-14 w-24 shrink-0 rounded-lg ${v.ativo ? '' : 'opacity-40 grayscale'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">{v.titulo}</p>
                      <p className="text-xs text-slate-500">
                        {v.origem === 'arquivo' ? '📱 No aparelho' : '▶️ YouTube (precisa de internet)'} ·{' '}
                        <button onClick={() => confirmar(`Remover "${v.titulo}"?`) && acoes.removerVideo(v.id)} className="underline">
                          Remover
                        </button>
                      </p>
                    </div>
                    <Interruptor ligado={v.ativo} aoMudar={() => acoes.alternarVideo(v.id)} rotulo={`Mostrar "${v.titulo}" para a criança`} />
                  </li>
                ))}
              </ul>
            </Cartao>
          );
        })
      )}
      <Espaco quantos={videos.length} />
    </>
  );
}

function Espaco({ quantos }: { quantos: number }) {
  const [texto, setTexto] = useState('');
  useEffect(() => {
    espaco().then(({ usado, total }) => total && setTexto(`Espaço usado pelo app: ${formatarBytes(usado)} de ${formatarBytes(total)} disponíveis.`));
  }, [quantos]);
  return texto ? <p className="text-center text-xs text-slate-500">{texto}</p> : null;
}

function FormArquivo({ acoes }: { acoes: AcoesPais }) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('biblico');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [chave, setChave] = useState(0); // para limpar o campo de arquivo

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!arquivo) return setErro('Escolha um vídeo do aparelho.');
    const limpo = titulo.trim();
    if (!limpo) return setErro('Escreva um título.');
    setSalvando(true);
    setErro('');
    try {
      const { miniatura, duracao } = await prepararVideo(arquivo);
      const id = novoId();
      await guardarArquivo(id, arquivo, miniatura);
      acoes.adicionarVideo({ id, origem: 'arquivo', duracao, titulo: limpo.slice(0, 120), categoria, ativo: true });
      setArquivo(null);
      setTitulo('');
      setChave((k) => k + 1);
    } catch {
      setErro('Não deu para guardar. Pode ser falta de espaço no aparelho.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-4">
      <label className="block text-sm font-semibold">
        Vídeo do aparelho
        <input
          key={chave}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setArquivo(f);
            setErro('');
            if (f && !titulo) setTitulo(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
          }}
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-grama file:px-4 file:py-2 file:font-semibold file:text-folha-escura"
        />
      </label>
      {arquivo && <p className="text-xs text-slate-500">{formatarBytes(arquivo.size)}</p>}

      <label className="block text-sm font-semibold">
        Título
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} placeholder="Ex.: A arca de Noé" className={CAMPO} />
      </label>

      <div>
        <p className="mb-2 text-sm font-semibold">Tipo</p>
        <Pilulas opcoes={OPCOES_CATEGORIA} valor={categoria} aoMudar={setCategoria} />
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button type="submit" disabled={salvando} className="w-full rounded-xl bg-folha py-3 text-base font-bold text-white active:bg-folha-escura disabled:opacity-60">
        {salvando ? 'Guardando…' : 'Adicionar'}
      </button>
      <p className="text-xs text-slate-500">
        O vídeo fica guardado só neste aparelho e toca sem internet, no player do Sementinha. Use vídeos seus ou que você tem permissão para usar.
      </p>
    </form>
  );
}

function FormYoutube({ videos, acoes }: { videos: Video[]; acoes: AcoesPais }) {
  const [link, setLink] = useState('');
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('biblico');
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState('');

  const youtubeId = extrairIdYoutube(link);
  const repetido = youtubeId ? videos.some((v) => v.origem === 'youtube' && v.youtubeId === youtubeId) : false;

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
    acoes.adicionarVideo({ id: novoId(), origem: 'youtube', youtubeId, titulo: limpo.slice(0, 120), categoria, ativo: true });
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
          className={CAMPO}
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
        Vídeos do YouTube só aparecem com internet. O app esconde os botões e as sugestões, mas a marca do YouTube continua (regra deles).
      </p>
    </form>
  );
}

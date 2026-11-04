import { NOMES_ATIVIDADES, type AtividadeId } from '../../tipos.ts';
import type { AcoesPais } from './PainelPais.tsx';
import { Cartao, Interruptor, confirmar } from './ui.tsx';

export function AbaAjustes({ desligados, acoes }: { desligados: AtividadeId[]; acoes: AcoesPais }) {
  return (
    <>
      <Cartao titulo="O que aparece na salinha">
        <ul className="divide-y divide-slate-100">
          {(Object.keys(NOMES_ATIVIDADES) as AtividadeId[]).map((id) => (
            <li key={id} className="flex items-center justify-between py-3">
              <span className="font-semibold">{NOMES_ATIVIDADES[id]}</span>
              <Interruptor ligado={!desligados.includes(id)} aoMudar={() => acoes.alternarAtividade(id)} rotulo={`Mostrar ${NOMES_ATIVIDADES[id]}`} />
            </li>
          ))}
        </ul>
      </Cartao>

      <Cartao titulo="🔐 Tranque o aparelho na salinha" className="text-sm leading-relaxed">
        <p className="text-slate-600">
          O Sementinha esconde os botões de sair, mas só o próprio aparelho bloqueia o botão "início". Ligue uma vez:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
          <li>
            <b>Android:</b> Configurações → Segurança → <i>Fixar app</i> (ou <i>Fixação de tela</i>). Depois, nos apps recentes, toque no ícone do
            Sementinha → <i>Fixar</i>.
          </li>
          <li>
            <b>iPhone/iPad:</b> Ajustes → Acessibilidade → <i>Acesso Guiado</i>. Depois, aperte 3 vezes o botão lateral com o Sementinha aberto.
          </li>
        </ul>
      </Cartao>

      <Cartao titulo="🛡️ Privacidade" className="text-sm leading-relaxed">
        <p className="text-slate-600">
          Sem propaganda, sem chat e sem rastreador. Da criança, só guardamos apelido, bichinho, estrelinhas, acertos nos jogos e tempo de uso. Os vídeos que você escolhe do aparelho também ficam só nele.
          Por enquanto tudo fica <b>só neste aparelho</b>.
        </p>
        <button
          onClick={() => confirmar('Apagar todos os perfis, vídeos e o progresso deste aparelho? Não dá para desfazer.') && acoes.apagarTudo()}
          className="mt-3 rounded-lg px-3 py-2 font-semibold text-red-700 ring-1 ring-red-200 active:bg-red-50"
        >
          Apagar tudo
        </button>
      </Cartao>
    </>
  );
}

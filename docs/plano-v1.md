# Sementinha — plano da versão 1 (APROVADO pelo dono em 2026-11-04)

## Decisões
- Nome: **Sementinha** (sala de jogos dentro = "Sala LeComigo"). Livre em multimidiapro no GitHub.
- Pasta: `C:\projetos\sementinha`, repo próprio no GitHub (multimidiapro/sementinha).
- Stack: React + Vite + TS + Tailwind + Express (mesmo modelo do joaopaulooliveira.com), Supabase TESTE e PRODUÇÃO, deploy Git→Hostinger.
- Licença: **AGPL-3.0** (recomendada e aprovada).
- App instalável: PWA na v1; Play Store (via Capacitor, com startLockTask p/ fixar tela) na v2.
- Endereço: **subdomínio sementinha.joaopaulooliveira.com** (decidido pelo dono). Criar como app Node próprio na Hostinger só na etapa de deploy.

## Decisão de 2026-11-04: funcionar sem internet
- O app inteiro funciona sem internet (PWA com cópia guardada no aparelho).
- Vídeos: o padrão são **arquivos do próprio aparelho** (MP4 escolhido pelos pais, guardado no IndexedDB), que tocam sem internet num player 100% do app, em galeria e tela cheia.
- YouTube continua como opção, só com internet: sem controles nem sugestões, mas a marca do YouTube fica (regra deles; não dá para baixar nem esconder o logo).

## Entra na v1
1. Sala LeComigo: jogos **Vogais** e **Cores**. App fala (voz do aparelho, speechSynthesis), criança TOCA na tela (sem microfone). Festa + estrelinha ao acertar.
2. Vídeos: só links do YouTube colados pelos pais; youtube-nocookie; ao terminar, fecha o player e mostra tela própria (sem sugestões).
3. Área dos pais: login e-mail/senha; sair da salinha só pelo ícone dos pais + continha (ex. 7+5). O PAI escolhe o perfil (criança não troca). Limite de minutos/dia por filho (tela "Hora de descansar!"). Liga/desliga jogos e vídeos.
4. Salinha trancada: tela cheia, sem botão de sair/links externos; passo a passo para "Fixar app" (Android) / "Acesso Guiado" (iOS).
5. Relatório por filho: tempo de uso, o que praticou, acertos/erros por item, estrelinhas ("já aprendeu").

## Fica para depois
Sílabas, alfabeto, números (v1.1); Play Store; vídeos próprios; microfone; lista inicial de vídeos curada.

## Privacidade (regras)
Sem anúncio, chat, analytics ou rastreador de terceiros. Da criança só apelido + bichinho (sem nome completo, foto, localização). Dados pertencem à conta dos pais (RLS por família). Botão "apagar tudo". Página de privacidade simples (LGPD + política Família do Google Play).

## Ordem depois do aprovado
1. Pasta + repo GitHub (licença, README, modelos de issue/PR).
2. Visual + área dos pais + perfis.
3. Jogos Vogais e Cores.
4. Vídeos, limite de tempo, relatório.
5. PWA + deploy na Hostinger.
Obs.: precisa de 2 projetos Supabase novos (TESTE e PRODUÇÃO).

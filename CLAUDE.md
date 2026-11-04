# Sementinha: instruções para o Claude

- O dono é João Paulo Oliveira: não é programador. Fale em português do Brasil, com respostas curtas, uma etapa por vez. Decisão de negócio é dele: dê opções com uma recomendação. Nunca peça senha, token nem chave.
- Plano aprovado da versão 1: [docs/plano-v1.md](docs/plano-v1.md).
- Stack: React + Vite + TypeScript + Tailwind + Express (server.ts → dist-server/server.cjs, entry server.cjs), Supabase (TESTE e PRODUÇÃO), deploy automático do GitHub na Hostinger em sementinha.joaopaulooliveira.com.
- É para crianças: nada de anúncio, chat, analytics ou rastreador; da criança só apelido + bichinho; dados são dos pais (RLS por família); nada que leve a criança para fora da salinha.
- Segredo só no servidor (nunca `VITE_`); `.env` fora do git.
- Build passando antes de dizer "pronto". Commits curtos em português. Push só com pedido do dono.
- Licença AGPL-3.0.

# PantryPal

PantryPal é uma Progressive Web App mobile-first para lista de compras partilhada e stock simples de casa. Foi pensada para correr num NAS em Docker, sem Vercel, Firebase, Supabase, volume de uploads ou backend gerido no MVP.

## Arquitetura

Next.js com App Router e TypeScript é uma boa escolha para esta PWA auto-alojada porque corre como um servidor Node normal em Docker, gera build standalone para produção, serve uma app instalável no iPhone e mantém a persistência no servidor sem lock-in.

SQLite é a base de dados do MVP. Para uma casa de duas pessoas, há poucas escritas, o backup é um só ficheiro e o deployment em NAS é mais simples do que manter PostgreSQL. O modelo já guarda household/user em cada entidade importante, por isso uma migração futura para PostgreSQL continua simples se a app crescer.

## Funcionalidades

- Lista de compras rápida, agrupada por categoria, com quantidades, notas, comprar/desmarcar, apagar, artigos recentes e comprados recolhidos.
- Ao marcar um artigo como comprado, ele é adicionado ou incrementado automaticamente no stock.
- Stock de casa leve, agrupado por local, com adicionar rápido, +/- quantidade, stock baixo e adicionar às compras.
- Sugestões locais baseadas em stock baixo e artigos comprados com frequência.
- Entrada por foto com câmara/upload, pré-visualização temporária, análise mock, revisão editável e fallback manual.
- Definições focadas só em notificações.
- Manifest e service worker para instalação como PWA e cache básica da shell.

## Desenvolvimento Local

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Abre `http://localhost:3000`. A app começa em `/shopping`.

Comandos úteis:

```bash
npm run typecheck
npm test
npm run build
```

## Docker / NAS

```bash
cp .env.example .env
docker compose up -d --build
```

A app escuta em `${PORT:-3000}` e guarda o SQLite em `/data/pantrypal.db` dentro do volume Docker `pantrypal_data`.

Exemplo para NAS:

```env
PORT=3000
APP_URL=https://pantry.example.com
DATABASE_URL=file:/data/pantrypal.db
ENABLE_EXTERNAL_IMAGE_ANALYSIS=false
IMAGE_ANALYSIS_PROVIDER=mock
SEED_DEMO_DATA=false
```

Para backup, guarda apenas o volume/ficheiro da base de dados. Não existe volume de uploads nem pasta de fotos.

## Privacidade Das Fotos

As fotos não são guardadas. A imagem selecionada existe apenas na memória do browser como object URL e depois como payload temporário do pedido de análise. O endpoint não escreve imagens em disco, base de dados, logs, backups, pasta de uploads ou volume Docker. Só os artigos confirmados pelo utilizador são persistidos.

A análise externa está desligada por defeito:

```env
ENABLE_EXTERNAL_IMAGE_ANALYSIS=false
IMAGE_ANALYSIS_PROVIDER=mock
```

Se um fornecedor externo, como OpenAI vision, for ativado no futuro, isso deve ficar explícito: as imagens saem do NAS durante o processamento e a opção tem de continuar opt-in.

## Notificações

As notificações são opcionais. A app guarda preferências para stock baixo, lembrete semanal e lista por terminar. A entrega real de push pode ser adicionada mais tarde por cima deste modelo.

## Segurança

- Não commitar `.env`, segredos, bases de dados SQLite, logs ou imagens geradas.
- Usar HTTPS quando houver acesso remoto.
- Preferir VPN ou reverse proxy seguro fora da rede local.
- Manter dados de runtime no volume Docker da base de dados.
- Não há rotas admin/debug em produção.

## Git

```bash
git status
git remote -v
git add .
git commit -m "Localize app to European Portuguese"
git push origin main
```

Se o repositório usar outra branch por defeito, faz push para essa branch.

## Próximos Passos

- Trocar o utilizador mockado por autenticação simples, por exemplo PIN/password da casa.
- Adicionar sync em tempo real entre telemóveis com polling ou WebSockets.
- Adicionar entrega agendada de lembretes.
- Ligar OpenAI vision, modelo local, OCR ou códigos de barras atrás da interface de análise de imagem.
- Melhorar filas offline se a app for usada fora da rede do NAS.

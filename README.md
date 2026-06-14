# 🌿 Reflexo

> "Um espaço seguro para olhar para dentro."

Reflexo é uma plataforma full stack de apoio emocional, autoconhecimento e conexão anônima. Com diário pessoal privado, mapa emocional, cartas para o futuro, álbum de memórias e um fórum anônimo moderado, o sistema foi pensado para ser acolhedor, seguro e respeitoso — **sem nunca substituir acompanhamento psicológico profissional.**

---

## 📚 Sumário

1. [Tecnologias utilizadas](#-tecnologias-utilizadas)
2. [Estrutura do projeto](#-estrutura-do-projeto)
3. [Pré-requisitos](#-pré-requisitos)
4. [Configuração do Supabase](#-configuração-do-supabase)
5. [Passo a passo para rodar localmente](#-passo-a-passo-para-rodar-localmente)
6. [Como usar a plataforma](#-como-usar-a-plataforma)
7. [Tornando um usuário administrador](#-tornando-um-usuário-administrador)
8. [Deploy](#-deploy)
9. [Segurança e privacidade](#-segurança-e-privacidade)

---

## 🛠 Tecnologias utilizadas

### Frontend
- **React + Vite** — base da aplicação e build rápido
- **React Router DOM** — roteamento entre páginas
- **Tailwind CSS** — estilização com a paleta visual personalizada
- **Framer Motion** — animações suaves (transições de página, álbum, cartas, modais)
- **React Hook Form + Zod** — formulários e validação (login, cadastro, recuperação de senha)
- **Axios** — comunicação com a API
- **Lucide React** — ícones
- **Recharts** — gráficos do mapa emocional e dashboard

### Backend
- **Node.js + Express** — API REST
- **Supabase Auth** — autenticação (cadastro, login, recuperação de senha)
- **JWT** — validação de sessão nas rotas protegidas
- **Helmet, CORS, express-rate-limit, express-validator** — segurança da API
- **sanitize-html** — sanitização de conteúdo enviado pelos usuários (proteção contra XSS)

### Banco de dados, Auth e Storage
- **Supabase PostgreSQL** — banco de dados relacional com Row Level Security (RLS)
- **Supabase Auth** — gerenciamento de usuários
- **Supabase Storage** — upload de imagens do álbum de memórias

---

## 📁 Estrutura do projeto

```
reflexo/
├── backend/
│   ├── src/
│   │   ├── config/        # cliente Supabase (service role)
│   │   ├── middleware/     # autenticação, moderação automática
│   │   ├── routes/          # rotas da API (auth, diary, mood, letters, memories, forum, profile, admin, notifications)
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute, EmotionTagPicker, etc.
│   │   ├── context/          # AuthContext (sessão Supabase)
│   │   ├── pages/             # Landing, Login, Dashboard, Diary, MoodMap, Letters, Memories, Forum, Profile, AdminPanel...
│   │   ├── services/          # supabaseClient.js, api.js (axios)
│   │   └── styles/             # index.css (texturas de papel, álbum, polaroid)
│   ├── package.json
│   └── .env.example
└── database/
    └── schema.sql            # script completo para o Supabase (tabelas + RLS)
```

---

## ✅ Pré-requisitos

- **Node.js 18+** e **npm** instalados
- Uma conta gratuita em [supabase.com](https://supabase.com)
- Editor de código (recomendado: VS Code)

---

## 🗄 Configuração do Supabase

1. Crie um novo projeto em [supabase.com](https://supabase.com).
2. No painel do projeto, vá em **SQL Editor** → **New query**.
3. Copie todo o conteúdo do arquivo `database/schema.sql` e execute. Isso vai criar:
   - Todas as tabelas (`profiles`, `diary_entries`, `mood_logs`, `future_letters`, `memories`, `forum_categories`, `forum_posts`, `forum_comments`, `reports`, `notifications`, `admin_logs`, etc.)
   - As emoções e categorias iniciais do fórum (já populadas)
   - Todas as políticas de **Row Level Security (RLS)**
4. Crie o bucket de armazenamento para o álbum de memórias:
   - Vá em **Storage** → **New bucket**
   - Nome: `memories`
   - Marque como **privado** (não público)
5. Pegue as credenciais do projeto em **Project Settings → API**:
   - `Project URL` → será o `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon public` key → será o `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - `service_role` key (⚠️ secreta, nunca exponha no frontend) → será o `SUPABASE_SERVICE_ROLE_KEY` do backend

> ⚠️ **Já tem um projeto Supabase configurado com uma versão anterior do Reflexo?** Você não precisa recriar tudo. Basta rodar no SQL Editor os três comandos `alter table` que estão comentados no final do `database/schema.sql` — eles adicionam as novas colunas de avatar, livros, músicas e Spotify à tabela `profiles` sem apagar nenhum dado existente.

---

## 🚀 Passo a passo para rodar localmente

### 1. Extraia o projeto

Descompacte o arquivo `.zip` recebido. Você terá a pasta `reflexo/` com `frontend/`, `backend/` e `database/`.

### 2. Configurar e rodar o Backend

```bash
cd reflexo/backend
npm install
cp .env.example .env
```

Abra o arquivo `.env` e preencha:

```env
PORT=4000
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_ANON_KEY=sua-anon-key
JWT_SECRET=qualquer-string-secreta-aleatoria
FRONTEND_URL=http://localhost:5173
```

Rode o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O backend estará disponível em `http://localhost:4000`. Você pode testar com `http://localhost:4000/api/health`.

### 3. Configurar e rodar o Frontend

Em outro terminal:

```bash
cd reflexo/frontend
npm install
cp .env.example .env
```

Abra o `.env` e preencha:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_API_URL=http://localhost:4000/api
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

### 4. Pronto! 🎉

Acesse `http://localhost:5173` no navegador, crie uma conta e explore a plataforma.

---

## 📖 Como usar a plataforma

### Landing page
Apresenta a proposta do Reflexo, com botões para **Começar agora** (cadastro) e **Explorar Reflexo**.

### Cadastro e login
Crie uma conta informando apenas **nickname**, **e-mail** e **senha** (não solicitamos CPF ou telefone). Caso esqueça a senha, use **Esqueci minha senha** — você receberá um e-mail do Supabase com o link de redefinição.

### Dashboard
Após o login, você verá:
- Saudação personalizada pelo seu nickname
- Frase reflexiva do dia
- Gráfico do seu humor na última semana
- Últimas entradas do diário
- Cartas para o futuro disponíveis para abrir

### Diário pessoal (`/diario`)
- Escreva entradas com título e conteúdo em um visual inspirado em papel
- Marque as emoções sentidas (tags) e a intensidade emocional (1–10)
- Preencha opcionalmente "O que aconteceu hoje?" e "O que eu gostaria de lembrar?"
- Após salvar, você recebe uma **sugestão reflexiva e acolhedora** (nunca clínica)
- Pesquise por palavra-chave, filtre por emoção e exporte suas entradas em PDF (via impressão do navegador)

### Mapa emocional (`/mapa-emocional`)
- Visualize gráficos de intensidade emocional ao longo do tempo (7, 30 ou 90 dias)
- Veja a frequência de cada emoção registrada
- Receba insights simples, como "Você registrou mais cansaço nesta semana"

### Cartas para o futuro (`/cartas`)
- Escreva uma carta para você mesmo(a) e escolha quando ela poderá ser aberta (1 mês, 3 meses, 6 meses, 1 ano ou data personalizada)
- Receba um aviso (no painel e, opcionalmente, por e-mail) quando a carta estiver disponível
- Abra a carta em uma interface especial e emocional

### Álbum de memórias (`/memorias`)
- Adicione memórias com título, descrição, data e foto (opcional)
- As memórias são organizadas em "páginas de álbum" por ano e mês, com molduras estilo polaroid
- Marque memórias favoritas com o ícone de coração

### Fórum anônimo (`/forum`)
- Navegue pelas categorias (Ansiedade, Autoestima, Relacionamentos, Família, Luto, etc.)
- Compartilhe um desabafo anonimamente — apenas seu nickname é exibido
- Comente em posts de outras pessoas com gentileza
- Denuncie conteúdos que violem as regras da comunidade (a denúncia vai para a fila de moderação)
- Posts/comentários com possível conteúdo ofensivo passam por **moderação automática** e ficam pendentes até aprovação manual

### Perfil (`/perfil`)
- Veja suas estatísticas (entradas no diário, memórias salvas, humor médio do mês)
- Edite seu nickname, preferências de notificação e tema
- **Escolha um avatar** estilo "figurinha" entre dezenas de opções divertidas
- Adicione **livros e músicas favoritas** ao seu perfil (e marque o Spotify como conectado — a importação automática de playlists é um próximo passo)
- **Exporte todos os seus dados** em JSON (conformidade com a LGPD)
- **Exclua sua conta permanentemente**, se desejar

### Painel administrativo (`/admin`)
Disponível apenas para usuários com papel `admin` (veja a seção abaixo). Permite:
- Ver métricas gerais da plataforma
- Buscar, suspender ou banir usuários
- Aprovar ou remover posts/comentários da fila de moderação
- Gerenciar denúncias
- Criar novas categorias do fórum
- Enviar comunicados globais para todos os usuários

---

## 👑 Tornando um usuário administrador

Por padrão, todo novo usuário é criado com o papel `user`. Para promover alguém a administrador:

1. Crie uma conta normalmente pelo cadastro do Reflexo.
2. No Supabase, vá em **SQL Editor** e execute:

```sql
update profiles set role = 'admin' where nickname = 'SEU_NICKNAME';
```

3. Faça login novamente (ou atualize a página) — o link **Admin** e a rota `/admin` ficarão acessíveis.

---

## ☁️ Deploy

- **Frontend**: pronto para deploy na [Vercel](https://vercel.com). Configure as variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`) no painel do projeto.
- **Backend**: pronto para deploy no [Railway](https://railway.app) ou [Render](https://render.com). Configure as variáveis de ambiente do `.env` no painel do serviço e aponte `FRONTEND_URL` para a URL pública do frontend.
- Lembre-se de atualizar `VITE_API_URL` no frontend para a URL pública do backend depois do deploy.

---

## 🔒 Segurança e privacidade

- Diário, cartas e memórias são **privados por padrão** e protegidos por Row Level Security no Supabase — cada usuário só acessa seus próprios dados.
- O fórum é **100% anônimo**: nenhum e-mail ou dado pessoal é exibido publicamente, apenas o nickname escolhido.
- A API possui **rate limiting**, **Helmet**, **CORS configurado**, **validação de entrada** e **sanitização de HTML** contra XSS.
- Conteúdo do fórum passa por **moderação automática** (filtro de palavras ofensivas, discurso de ódio, spam e links suspeitos) antes de ser publicado, com revisão manual pelo painel administrativo.
- Em conformidade com a **LGPD**, usuários podem exportar todos os seus dados ou excluir permanentemente a conta.

> ⚠️ **Aviso importante:** O Reflexo não substitui acompanhamento psicológico profissional, não realiza diagnósticos e não oferece aconselhamento clínico. Em situações de crise emocional, procure ajuda especializada ou os serviços de emergência da sua região (no Brasil, o **CVV** está disponível pelo telefone **188**, 24 horas por dia).

---

Feito com cuidado, para ser um espaço seguro de reflexão. 🌷

-- =========================================================
-- REFLEXO - Schema do banco de dados (Supabase / PostgreSQL)
-- Execute este script no SQL Editor do Supabase.
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- PROFILES
-- Estende auth.users com dados públicos/privados do perfil.
-- ---------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique not null,
  avatar_seed text default 'default',
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended', 'banned')),
  notifications_enabled boolean default true,
  theme text default 'light' check (theme in ('light', 'dark')),
  favorite_books jsonb default '[]'::jsonb,
  favorite_music jsonb default '[]'::jsonb,
  spotify_connected boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Usuários podem ver o próprio perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar o próprio perfil"
  on profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------
-- DIARY ENTRIES (Diário Pessoal)
-- ---------------------------------------------------------
create table if not exists diary_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  emotion_tags text[] default '{}',
  intensity int check (intensity between 1 and 10),
  what_happened text,
  what_to_remember text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table diary_entries enable row level security;

create policy "Usuários gerenciam suas entradas de diário"
  on diary_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- EMOTIONS (catálogo de emoções/tags disponíveis)
-- ---------------------------------------------------------
create table if not exists emotions (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  label text not null,
  emoji text
);

alter table emotions enable row level security;

create policy "Qualquer usuário autenticado pode ler emoções"
  on emotions for select
  using (auth.role() = 'authenticated');

insert into emotions (slug, label, emoji) values
  ('ansiedade', 'Ansiedade', '😟'),
  ('alegria', 'Alegria', '😊'),
  ('medo', 'Medo', '😨'),
  ('gratidao', 'Gratidão', '🙏'),
  ('cansaco', 'Cansaço', '😴'),
  ('tristeza', 'Tristeza', '😢'),
  ('raiva', 'Raiva', '😠'),
  ('calma', 'Calma', '🌿')
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- MOOD LOGS (alimenta o Mapa Emocional)
-- ---------------------------------------------------------
create table if not exists mood_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intensity int check (intensity between 1 and 10),
  emotion_tags text[] default '{}',
  source_entry_id uuid references diary_entries(id) on delete set null,
  created_at timestamptz default now()
);

alter table mood_logs enable row level security;

create policy "Usuários gerenciam seus registros de humor"
  on mood_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- FUTURE LETTERS (Cartas para o Futuro)
-- ---------------------------------------------------------
create table if not exists future_letters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  deliver_at timestamptz not null,
  notify_email boolean default false,
  is_opened boolean default false,
  opened_at timestamptz,
  created_at timestamptz default now()
);

alter table future_letters enable row level security;

create policy "Usuários gerenciam suas cartas"
  on future_letters for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- MEMORIES (Álbum de Memórias)
-- ---------------------------------------------------------
create table if not exists memories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  memory_date date not null,
  image_url text,
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table memories enable row level security;

create policy "Usuários gerenciam suas memórias"
  on memories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- FORUM CATEGORIES
-- ---------------------------------------------------------
create table if not exists forum_categories (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text,
  color text default '#B06078',
  created_at timestamptz default now()
);

alter table forum_categories enable row level security;

create policy "Categorias são públicas para leitura"
  on forum_categories for select
  using (true);

insert into forum_categories (name, description, color) values
  ('Ansiedade', 'Um espaço para falar sobre ansiedade e formas de lidar com ela.', '#B06078'),
  ('Autoestima', 'Reflexões sobre autoimagem, valor próprio e aceitação.', '#C8A58F'),
  ('Relacionamentos', 'Conversas sobre vínculos, amizades e relações afetivas.', '#AEB6B7'),
  ('Faculdade e estudos', 'Desafios acadêmicos, rotina de estudos e pressão.', '#DCC7B0'),
  ('Família', 'Histórias e sentimentos sobre a vida em família.', '#5E4B45'),
  ('Luto', 'Espaço acolhedor para falar sobre perdas.', '#AEB6B7'),
  ('Solidão', 'Compartilhe como tem se sentido e encontre companhia.', '#B06078'),
  ('Mudanças de vida', 'Transições, recomeços e novas fases.', '#C8A58F'),
  ('Conquistas e gratidão', 'Celebre pequenas e grandes vitórias.', '#DCC7B0'),
  ('Desabafos livres', 'Um lugar livre para desabafar sem julgamentos.', '#5E4B45')
on conflict (name) do nothing;

-- ---------------------------------------------------------
-- FORUM POSTS (anônimos)
-- ---------------------------------------------------------
create table if not exists forum_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  category_id uuid references forum_categories(id) on delete set null,
  title text not null,
  content text not null,
  status text not null default 'approved' check (status in ('approved', 'pending', 'removed')),
  flag_reasons text[],
  comment_count int default 0,
  created_at timestamptz default now()
);

alter table forum_posts enable row level security;

create policy "Posts aprovados são públicos"
  on forum_posts for select
  using (status = 'approved' or auth.uid() = user_id);

create policy "Usuários autenticados podem criar posts"
  on forum_posts for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- FORUM COMMENTS (anônimos)
-- ---------------------------------------------------------
create table if not exists forum_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  content text not null,
  status text not null default 'approved' check (status in ('approved', 'pending', 'removed')),
  flag_reasons text[],
  created_at timestamptz default now()
);

alter table forum_comments enable row level security;

create policy "Comentários aprovados são públicos"
  on forum_comments for select
  using (status = 'approved' or auth.uid() = user_id);

create policy "Usuários autenticados podem comentar"
  on forum_comments for insert
  with check (auth.uid() = user_id);

-- Função auxiliar para incrementar contagem de comentários
create or replace function increment_comment_count(post_id_input uuid)
returns void as $$
begin
  update forum_posts set comment_count = comment_count + 1 where id = post_id_input;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------
-- REPORTS (Denúncias)
-- ---------------------------------------------------------
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references auth.users(id) on delete set null,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz default now()
);

alter table reports enable row level security;

create policy "Usuários podem criar denúncias"
  on reports for insert
  with check (auth.uid() = reporter_id);

create policy "Usuários podem ver suas próprias denúncias"
  on reports for select
  using (auth.uid() = reporter_id);

-- ---------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  is_global boolean default true,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "Notificações globais são públicas para leitura"
  on notifications for select
  using (is_global = true);

-- ---------------------------------------------------------
-- ADMIN LOGS
-- ---------------------------------------------------------
create table if not exists admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

alter table admin_logs enable row level security;

-- Observação: as operações administrativas (admin_logs, moderação, métricas)
-- são realizadas pelo backend usando a service_role key, que ignora RLS.
-- As policies acima protegem o acesso direto via chave anônima (frontend).

-- ---------------------------------------------------------
-- STORAGE BUCKET (executar separadamente na seção Storage do Supabase
-- ou via SQL abaixo, se disponível)
-- ---------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('memories', 'memories', false);

-- ---------------------------------------------------------
-- COMO CRIAR O PRIMEIRO ADMINISTRADOR
-- 1. Cadastre-se normalmente pela aplicação.
-- 2. No SQL Editor do Supabase, execute:
--    update profiles set role = 'admin' where nickname = 'SEU_NICKNAME';
-- ---------------------------------------------------------

-- ---------------------------------------------------------
-- MIGRAÇÃO: se você já tinha executado uma versão anterior
-- deste schema (sem favoritos de livros/músicas e Spotify),
-- rode os comandos abaixo para atualizar a tabela profiles
-- sem perder os dados existentes:
-- ---------------------------------------------------------
-- alter table profiles add column if not exists favorite_books jsonb default '[]'::jsonb;
-- alter table profiles add column if not exists favorite_music jsonb default '[]'::jsonb;
-- alter table profiles add column if not exists spotify_connected boolean default false;

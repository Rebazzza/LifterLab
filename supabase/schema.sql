-- ============================================================
-- 1) TIPOS ENUMERADOS
-- ============================================================
create type categoria_ejercicio as enum (
  'Sentadilla',
  'Press de Banca',
  'Peso Muerto',
  'Variante / Accesorio'
);

create type estado_sesion as enum (
  'activa',
  'completada',
  'cancelada'
);

-- ============================================================
-- 2) TABLA DE PERFILES DE USUARIO
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  unidad_peso text not null default 'kg',
  peso_corporal numeric(5,2),
  altura_cm numeric(5,2),
  genero text default 'masculino',
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: crear profile automáticamente al registrar un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 3) CATÁLOGO DE EJERCICIOS
-- ============================================================
create table if not exists public.ejercicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria categoria_ejercicio not null,
  es_con_barra boolean not null default true,
  usuario_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (nombre, usuario_id)
);

-- ============================================================
-- 4) RUTINAS (Plantillas)
-- ============================================================
create table if not exists public.rutinas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  fecha_creacion timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.rutina_ejercicios (
  id uuid primary key default gen_random_uuid(),
  rutina_id uuid not null references public.rutinas(id) on delete cascade,
  ejercicio_id uuid references public.ejercicios(id) on delete set null,
  nombre_snapshot text not null,
  es_con_barra boolean not null default true,
  usa_rpe boolean not null default false,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.serie_rutina (
  id uuid primary key default gen_random_uuid(),
  rutina_ejercicio_id uuid not null references public.rutina_ejercicios(id) on delete cascade,
  orden int not null default 0,
  peso numeric(6,2),
  reps int not null,
  rpe numeric(3,1),
  porcentaje numeric(5,2),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5) SESIONES DE ENTRENAMIENTO
-- ============================================================
create table if not exists public.sesiones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  rutina_id uuid references public.rutinas(id) on delete set null,
  nombre text not null,
  estado estado_sesion not null default 'activa',
  fecha_inicio timestamptz not null default now(),
  fecha_fin timestamptz,
  ultimo_cambio timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.sesion_ejercicios (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid not null references public.sesiones(id) on delete cascade,
  ejercicio_id uuid references public.ejercicios(id) on delete set null,
  nombre text not null,
  es_con_barra boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.serie_sesion (
  id uuid primary key default gen_random_uuid(),
  sesion_ejercicio_id uuid not null references public.sesion_ejercicios(id) on delete cascade,
  orden int not null default 0,
  peso numeric(6,2),
  peso_real numeric(6,2),
  reps int not null,
  rpe numeric(3,1),
  porcentaje numeric(5,2),
  completada boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6) MARCAS Y RÉCORDS PERSONALES (1RM)
-- ============================================================
create table if not exists public.marcas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  ejercicio_id uuid not null references public.ejercicios(id) on delete cascade,
  peso numeric(6,2) not null,
  reps int not null,
  rpe numeric(3,1),
  est_1rm numeric(6,2) not null,
  fecha timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7) NUEVA: MÓDULO DE COMPETENCIA 🏆
-- ============================================================
create table if not exists public.competencias (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nombre_torneo text default 'Simulacro de Tarima',
  peso_corporal numeric(5,2) not null,
  categoria_genero text default 'masculino',
  total_oficial numeric(6,2) default 0,
  puntos_dots numeric(6,2) default 0,
  
  -- Intentos y soportes almacenados en JSON para máxima flexibilidad
  datos_squat jsonb default '{}'::jsonb,
  datos_bench jsonb default '{}'::jsonb,
  datos_deadlift jsonb default '{}'::jsonb,
  
  fecha timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8) CONFIGURACIÓN Y PREFERENCIAS
-- ============================================================
create table if not exists public.config_usuario (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  unidad_peso text not null default 'kg',
  sonidos boolean not null default true,
  notificaciones boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) & POLÍTICAS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.ejercicios enable row level security;
alter table public.rutinas enable row level security;
alter table public.rutina_ejercicios enable row level security;
alter table public.serie_rutina enable row level security;
alter table public.sesiones enable row level security;
alter table public.sesion_ejercicios enable row level security;
alter table public.serie_sesion enable row level security;
alter table public.marcas enable row level security;
alter table public.competencias enable row level security;
alter table public.config_usuario enable row level security;

-- Políticas de Autenticación Unificadas (Owner Only)
create policy "Perfil gestionable por dueño" on public.profiles for all using (auth.uid() = id);

create policy "Lectura publica de ejercicios" on public.ejercicios for select using (true);
create policy "Ejercicios propios gestionables" on public.ejercicios for all using (auth.uid() = usuario_id);

create policy "Rutinas gestionables por dueño" on public.rutinas for all using (auth.uid() = usuario_id);

create policy "Ejercicios de rutina gestionables" on public.rutina_ejercicios for all using (
  exists (select 1 from public.rutinas r where r.id = rutina_id and r.usuario_id = auth.uid())
);

create policy "Series de rutina gestionables" on public.serie_rutina for all using (
  exists (
    select 1 from public.rutina_ejercicios re
    join public.rutinas r on r.id = re.rutina_id
    where re.id = rutina_ejercicio_id and r.usuario_id = auth.uid()
  )
);

create policy "Sesiones gestionables por dueño" on public.sesiones for all using (auth.uid() = usuario_id);

create policy "Ejercicios de sesion gestionables" on public.sesion_ejercicios for all using (
  exists (select 1 from public.sesiones s where s.id = sesion_id and s.usuario_id = auth.uid())
);

create policy "Series de sesion gestionables" on public.serie_sesion for all using (
  exists (
    select 1 from public.sesion_ejercicios se
    join public.sesiones s on s.id = se.sesion_id
    where se.id = sesion_ejercicio_id and s.usuario_id = auth.uid()
  )
);

create policy "Marcas gestionables por dueño" on public.marcas for all using (auth.uid() = usuario_id);
create policy "Competencias gestionables por dueño" on public.competencias for all using (auth.uid() = usuario_id);
create policy "Config gestionable por dueño" on public.config_usuario for all using (auth.uid() = usuario_id);

-- ============================================================
-- TRIGGERS DE AUTOMATIZACIÓN
-- ============================================================
create or replace function public.handle_new_user_config()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.config_usuario (usuario_id) values (new.id) on conflict (usuario_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_config();
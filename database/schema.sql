-- LANZEC MOTO EXPRESS — esquema inicial para revisar antes de ejecutar.
-- No es una migración completa de producción. RLS y funciones transaccionales
-- deben revisarse y añadirse antes de abrir el sistema a usuarios reales.
create extension if not exists pgcrypto;

create type public.app_role as enum ('cliente','transportista','admin');
create type public.driver_review_status as enum ('pendiente','aprobado','rechazado','suspendido');
create type public.service_kind as enum ('moto_taxi','delivery');
create type public.service_status as enum ('pendiente','aceptado','camino_recojo','recogido','en_destino','completado','cancelado');
create type public.offer_status as enum ('enviada','aceptada','rechazada','cerrada');
create type public.payment_method as enum ('efectivo','yape','plin','transferencia');
create type public.payment_review_status as enum ('pendiente_revision','revisado','observado');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'cliente',
  full_name text not null,
  phone text,
  photo_path text,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.driver_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  review_status public.driver_review_status not null default 'pendiente',
  rejection_reason text,
  service_moto_taxi boolean not null default false,
  service_delivery boolean not null default false,
  available boolean not null default false,
  vehicle_make text,
  vehicle_model text,
  plate text,
  license_number text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.driver_profiles(user_id) on delete cascade,
  document_type text not null check (document_type in ('dni_front','dni_back','license','ownership','profile_photo')),
  storage_path text not null,
  review_status public.driver_review_status not null default 'pendiente',
  rejection_reason text,
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  kind public.service_kind not null,
  pickup_text text not null,
  destination_text text not null,
  passenger_count integer check (passenger_count between 1 and 3),
  instructions text,
  package_description text,
  recipient_name text,
  recipient_phone text,
  status public.service_status not null default 'pendiente',
  assigned_driver_id uuid references public.driver_profiles(user_id),
  accepted_offer_id uuid,
  agreed_price numeric(10,2) check (agreed_price >= 0),
  driver_confirmation_deadline timestamptz,
  cancellation_actor uuid references public.profiles(id),
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_offers (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.service_requests(id) on delete cascade,
  driver_id uuid not null references public.driver_profiles(user_id),
  price numeric(10,2) not null check (price > 0),
  status public.offer_status not null default 'enviada',
  created_at timestamptz not null default now(),
  unique(service_id, driver_id)
);

alter table public.service_requests
  add constraint service_requests_accepted_offer_fk
  foreign key (accepted_offer_id) references public.service_offers(id);

create table public.service_status_history (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.service_requests(id) on delete cascade,
  changed_by uuid references public.profiles(id),
  old_status public.service_status,
  new_status public.service_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.payment_records (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null unique references public.service_requests(id) on delete cascade,
  method public.payment_method not null,
  amount numeric(10,2) not null check (amount >= 0),
  registered_by uuid not null references public.profiles(id),
  review_status public.payment_review_status not null default 'pendiente_revision',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table public.service_ratings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null unique references public.service_requests(id) on delete cascade,
  client_id uuid not null references public.profiles(id),
  driver_id uuid not null references public.driver_profiles(user_id),
  stars integer not null check (stars between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.service_requests(id),
  filed_by uuid not null references public.profiles(id),
  description text not null,
  status text not null default 'pendiente' check (status in ('pendiente','en_revision','resuelto')),
  resolution text,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  event_type text not null,
  related_service_id uuid references public.service_requests(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null,
  target_user_id uuid references public.profiles(id),
  target_service_id uuid references public.service_requests(id),
  reason text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

create index service_requests_client_created_idx on public.service_requests(client_id, created_at desc);
create index service_requests_status_idx on public.service_requests(status);
create index service_offers_service_idx on public.service_offers(service_id);
create index service_offers_driver_idx on public.service_offers(driver_id);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);

-- RLS se habilita desde el inicio. Las políticas restrictivas se añaden en la
-- siguiente etapa antes de insertar datos reales o publicar la aplicación.
alter table public.profiles enable row level security;
alter table public.driver_profiles enable row level security;
alter table public.driver_documents enable row level security;
alter table public.service_requests enable row level security;
alter table public.service_offers enable row level security;
alter table public.service_status_history enable row level security;
alter table public.payment_records enable row level security;
alter table public.service_ratings enable row level security;
alter table public.complaints enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_audit_log enable row level security;

-- No se incluyen políticas abiertas deliberadamente: no se debe desplegar
-- hasta implementar políticas RLS, funciones RPC transaccionales y trigger
-- seguro para crear perfiles y controlar el rol administrativo.

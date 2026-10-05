alter table public.profiles
  add column if not exists swr_rate numeric,
  add column if not exists swr_is_manual boolean not null default false;

comment on column public.profiles.swr_rate is
  'Manual safe withdrawal rate as decimal, for example 0.04 for 4%. Null means auto.';

comment on column public.profiles.swr_is_manual is
  'When true, forecast uses swr_rate. When false, forecast calculates SWR automatically.';

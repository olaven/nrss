-- Up Migration
create table series (
  id text primary key,
  title text not null,
  subtitle text,
  link text not null,
  image_url text not null,
  last_fetched_at timestamptz not null,
  episodes jsonb not null default '[]'
);

create table vipps_agreements (
  id text primary key,
  agreement_id text not null,
  created_at timestamptz not null,
  valid_at timestamptz,
  revoked_at timestamptz
);

-- Down Migration
drop table vipps_agreements;
drop table series;

create table if not exists orders (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users not null,
  plan                    text not null,
  domain                  text not null,
  wp_admin_url            text,
  username                text,
  password                text,
  email                   text,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  status                  text default 'active',
  created_at              timestamptz default now()
);

alter table orders enable row level security;

create policy "Users see own orders"
  on orders for select
  using (auth.uid() = user_id);

-- Orders are written only by Edge Functions (service_role). Customers can only read their own rows.
-- (A user INSERT policy existed until 2026-10-23; it let users forge stripe_customer_id/subscription values.)
drop policy if exists "Users insert own orders" on orders;
revoke all on orders from anon;
revoke all on orders from authenticated;
grant select on orders to authenticated;
grant select, insert, update, delete on orders to service_role;

-- One Stripe subscription pays for exactly one site
create unique index if not exists orders_stripe_subscription_id_key
  on orders (stripe_subscription_id) where stripe_subscription_id is not null;

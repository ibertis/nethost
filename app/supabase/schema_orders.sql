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

create policy "Users insert own orders"
  on orders for insert
  with check (auth.uid() = user_id);

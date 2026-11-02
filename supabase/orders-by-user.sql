-- Orders belong to the account that placed them; customers track, edit and cancel only their own orders.

alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_user_id_idx on public.orders (user_id);

-- place_order: unchanged, except it records the signed-in customer (auth.uid() is null for the old anon call path).
create or replace function public.place_order(p_name text, p_phone text, p_address text, p_items jsonb)
 returns bigint
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_items jsonb := '[]'::jsonb;
  v_total integer := 0;
  v_id bigint;
  r record;
begin
  p_name := trim(coalesce(p_name, ''));
  p_phone := trim(coalesce(p_phone, ''));
  p_address := trim(coalesce(p_address, ''));
  if p_name = '' or p_phone = '' or p_address = '' then
    raise exception 'Name, phone and address are required';
  end if;
  if length(p_name) > 120 or length(p_phone) > 30 or length(p_address) > 500 then
    raise exception 'Details are too long';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Your cart is empty';
  end if;

  for r in
    with cart as (
      select i ->> 'id' as pid, least(greatest(sum((i ->> 'qty')::int), 1), 99) as qty
      from jsonb_array_elements(p_items) i
      group by 1
    )
    select p.id, p.name, p.price, p.image_url, cart.qty
    from cart join public.products p on p.id = cart.pid
  loop
    v_items := v_items || jsonb_build_object('id', r.id, 'name', r.name, 'price', r.price, 'qty', r.qty, 'image', r.image_url);
    v_total := v_total + r.price * r.qty;
    update public.products set stock = greatest(stock - r.qty, 0) where id = r.id;
  end loop;

  if jsonb_array_length(v_items) = 0 then
    raise exception 'These products are no longer available';
  end if;

  insert into public.orders (customer_name, phone, address, items, subtotal, user_id)
  values (p_name, p_phone, p_address, v_items, v_total, auth.uid())
  returning id into v_id;
  return v_id;
end $function$;

-- The signed-in customer's orders, newest first.
create or replace function public.my_orders()
 returns jsonb
 language sql
 stable
 security definer
 set search_path to ''
as $function$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', o.id, 'name', o.customer_name, 'phone', o.phone, 'address', o.address, 'items', o.items,
    'subtotal', o.subtotal, 'status', o.status, 'created_at', o.created_at
  ) order by o.created_at desc, o.id desc), '[]'::jsonb)
  from public.orders o
  where o.user_id = auth.uid()
$function$;

create or replace function public.cancel_my_order(p_id bigint)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  o public.orders;
begin
  select * into o from public.orders where id = p_id and user_id = auth.uid() for update;
  if not found then
    raise exception 'We couldn''t find this order in your account.';
  end if;
  if o.status = 'cancelled' then
    raise exception 'This order is already cancelled.';
  end if;
  if o.status <> 'pending' then
    raise exception 'This order is already being processed and can no longer be cancelled online. Please call us.';
  end if;
  update public.orders set status = 'cancelled', seen = false where id = o.id;
  return jsonb_build_object('id', o.id, 'status', 'cancelled');
end $function$;

create or replace function public.update_my_order(p_id bigint, p_name text, p_address text, p_items jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  o public.orders;
  v_items jsonb := '[]'::jsonb;
  v_total integer := 0;
  v_qty integer;
  v_stock integer;
  line jsonb;
begin
  select * into o from public.orders where id = p_id and user_id = auth.uid() for update;
  if not found then
    raise exception 'We couldn''t find this order in your account.';
  end if;
  if o.status <> 'pending' then
    raise exception 'This order is already being processed and can no longer be changed online. Please call us.';
  end if;

  p_name := trim(coalesce(p_name, ''));
  p_address := trim(coalesce(p_address, ''));
  if p_name = '' or p_address = '' then
    raise exception 'Name and address are required';
  end if;
  if length(p_name) > 120 or length(p_address) > 500 then
    raise exception 'Details are too long';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Invalid items';
  end if;

  for line in select * from jsonb_array_elements(o.items) loop
    select coalesce(sum(least(greatest((i ->> 'qty')::int, 0), 99)), 0) into v_qty
    from jsonb_array_elements(p_items) i where i ->> 'id' = line ->> 'id';
    if v_qty > (line ->> 'qty')::int then
      select stock into v_stock from public.products where id = line ->> 'id' for update;
      if coalesce(v_stock, 0) < v_qty - (line ->> 'qty')::int then
        raise exception 'Not enough stock for % — only % more available.', line ->> 'name', coalesce(v_stock, 0);
      end if;
    end if;
    if v_qty > 0 then
      v_items := v_items || jsonb_set(line, '{qty}', to_jsonb(v_qty));
      v_total := v_total + (line ->> 'price')::int * v_qty;
    end if;
    update public.products set stock = greatest(stock + ((line ->> 'qty')::int - v_qty), 0) where id = line ->> 'id';
  end loop;

  if jsonb_array_length(v_items) = 0 then
    raise exception 'An order needs at least one item. To drop it completely, cancel the order.';
  end if;

  update public.orders set customer_name = p_name, address = p_address, items = v_items, subtotal = v_total, seen = false where id = o.id;
  return jsonb_build_object('id', o.id);
end $function$;

-- Only signed-in customers can use the account functions.
revoke execute on function public.my_orders() from public, anon;
revoke execute on function public.cancel_my_order(bigint) from public, anon;
revoke execute on function public.update_my_order(bigint, text, text, jsonb) from public, anon;
grant execute on function public.my_orders() to authenticated;
grant execute on function public.cancel_my_order(bigint) to authenticated;
grant execute on function public.update_my_order(bigint, text, text, jsonb) to authenticated;

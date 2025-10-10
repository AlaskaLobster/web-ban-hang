-- Migration: create trigger to auto-create profile when a new auth.user is created

-- Function to insert a minimal profile record when a new auth.user is created
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, updated_at)
  values (new.id, new.email, now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger that fires after a new user row is added to auth.users
create trigger auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Function to sync some fields from auth.users.user_metadata into profiles on update
create or replace function public.sync_auth_user_to_profile()
returns trigger as $$
begin
  update public.profiles
  set
    full_name = coalesce(new.user_metadata->>'full_name', public.profiles.full_name),
    email = coalesce(new.email, public.profiles.email),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create trigger auth_user_updated
after update on auth.users
for each row execute procedure public.sync_auth_user_to_profile();

-- Basic RLS policies (adjust to your privacy requirements)
-- Note: If your project already uses RLS or custom policies, review before applying.

-- Allow authenticated users to select public profile fields
create policy if not exists allow_select_profiles on public.profiles
  for select using (auth.role() = 'authenticated');

-- Allow users to update their own profiles
create policy if not exists allow_update_own_profile on public.profiles
  for update using (auth.uid() = id);

-- Allow users to insert/update their own profile (client-side upsert)
create policy if not exists allow_insert_own_profile on public.profiles
  for insert with check (auth.uid() = id);


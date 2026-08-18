-- Buat tabel scans
create table scans (
  id uuid primary key default gen_random_uuid(),
  foto_url text not null,
  nama_makanan text not null,
  estimasi_porsi text,
  kalori numeric,
  protein_g numeric,
  karbohidrat_g numeric,
  lemak_g numeric,
  created_at timestamptz default now()
);

-- Enable RLS
alter table scans enable row level security;

-- Policy: allow all access (karena belum ada auth)
create policy "Allow all access on scans" on scans
  for all
  using (true)
  with check (true);

-- Buat bucket untuk foto makanan
insert into storage.buckets (id, name, public)
values ('food-photos', 'food-photos', true)
on conflict (id) do nothing;

-- Policy: allow upload
create policy "Anyone can upload food photos" on storage.objects
  for insert
  with check (bucket_id = 'food-photos');

-- Policy: allow read
create policy "Anyone can read food photos" on storage.objects
  for select
  using (bucket_id = 'food-photos');

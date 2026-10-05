alter table public.repair_bookings
  add column if not exists device_condition jsonb,
  add column if not exists device_estimate jsonb;

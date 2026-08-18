-- ====================================================================
-- VAGAGO SAAS - SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS (SUPABASE)
-- Execute este script no SQL Editor do Supabase (supabase.com)
-- ====================================================================

-- 1. Habilitar extensão de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'CLIENTE',
  phone TEXT,
  cpf TEXT,
  avatar TEXT,
  pix_key TEXT,
  bank_account TEXT,
  referral_code TEXT,
  credits NUMERIC(10, 2) DEFAULT 20.00,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE VEÍCULOS
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  plate TEXT NOT NULL,
  color TEXT,
  type TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE GARAGENS
CREATE TABLE IF NOT EXISTS public.parking_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  owner_name TEXT,
  owner_phone TEXT,
  owner_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  neighborhood TEXT,
  zip_code TEXT,
  lat NUMERIC(10, 6) NOT NULL,
  lng NUMERIC(10, 6) NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  reviews_count INTEGER DEFAULT 0,
  price_hourly NUMERIC(10, 2) NOT NULL,
  price_daily NUMERIC(10, 2) NOT NULL,
  price_monthly NUMERIC(10, 2),
  photos JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  allowed_vehicles JSONB DEFAULT '[]'::jsonb,
  size TEXT DEFAULT 'Padrão',
  is_covered BOOLEAN DEFAULT true,
  height_limit TEXT DEFAULT '2.10m',
  rules JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Aprovado',
  availability_status TEXT DEFAULT 'Disponível',
  is_available BOOLEAN DEFAULT true,
  available_hours TEXT DEFAULT '24 horas',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE RESERVAS
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_phone TEXT,
  space_id UUID REFERENCES public.parking_spaces(id) ON DELETE SET NULL,
  space_title TEXT,
  space_address TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  owner_name TEXT,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  total_hours NUMERIC(5, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) NOT NULL,
  owner_payout NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  total_price NUMERIC(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'PIX',
  payment_status TEXT DEFAULT 'Aprovado',
  booking_status TEXT DEFAULT 'Confirmado',
  qr_code_data TEXT NOT NULL,
  vehicle JSONB NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE SAQUES
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  pix_key TEXT NOT NULL,
  status TEXT DEFAULT 'Pendente',
  requested_at DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE CUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL,
  max_discount NUMERIC(10, 2) NOT NULL,
  valid_until DATE,
  usage_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PERMISSÕES DE SEGURANÇA (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "policy_users_access" ON public.users;
DROP POLICY IF EXISTS "policy_vehicles_access" ON public.vehicles;
DROP POLICY IF EXISTS "policy_spaces_access" ON public.parking_spaces;
DROP POLICY IF EXISTS "policy_bookings_access" ON public.bookings;
DROP POLICY IF EXISTS "policy_withdrawals_access" ON public.withdrawals;
DROP POLICY IF EXISTS "policy_coupons_access" ON public.coupons;

CREATE POLICY "policy_users_access" ON public.users FOR ALL USING (true);
CREATE POLICY "policy_vehicles_access" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "policy_spaces_access" ON public.parking_spaces FOR ALL USING (true);
CREATE POLICY "policy_bookings_access" ON public.bookings FOR ALL USING (true);
CREATE POLICY "policy_withdrawals_access" ON public.withdrawals FOR ALL USING (true);
CREATE POLICY "policy_coupons_access" ON public.coupons FOR ALL USING (true);

-- 9. DADOS INICIAIS
INSERT INTO public.users (name, email, role, phone, cpf, pix_key, referral_code, credits)
VALUES 
('Matheus Silva', 'matheus@cliente.com', 'CLIENTE', '(11) 98765-4321', '123.456.789-00', 'matheus@pix.com', 'MATHEUS20', 20.00),
('Carlos Alberto Mendes', 'carlos@proprietario.com', 'PROPRIETÁRIO', '(11) 99887-6655', '987.654.321-11', 'carlos.mendes@pix.com.br', 'CARLOS50', 50.00),
('Administrador VagaGo', 'admin@vagago.com.br', 'ADMINISTRADOR', '(11) 3003-8242', '000.000.000-00', 'admin@vagago.com.br', 'ADMIN100', 100.00)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.coupons (code, discount_percent, max_discount, valid_until, usage_count, status)
VALUES ('VAGAGO10', 10, 15.00, '2026-12-31', 142, 'Ativo')
ON CONFLICT (code) DO NOTHING;

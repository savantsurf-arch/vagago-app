-- ====================================================================
-- MIGRAÇÃO VAGAGO: RASTREAMENTO GPS EM TEMPO REAL (DRIVER LOCATIONS)
-- Data: 2026-11-17
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION DEFAULT 0.0,
  accuracy DOUBLE PRECISION DEFAULT 0.0,
  speed DOUBLE PRECISION,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT driver_locations_booking_id_key UNIQUE (booking_id)
);

CREATE INDEX IF NOT EXISTS idx_driver_locations_booking_id ON public.driver_locations(booking_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_user_id ON public.driver_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_updated_at ON public.driver_locations(updated_at);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "driver_locations_participant_select" ON public.driver_locations;
DROP POLICY IF EXISTS "driver_locations_driver_insert" ON public.driver_locations;
DROP POLICY IF EXISTS "driver_locations_driver_update" ON public.driver_locations;
DROP POLICY IF EXISTS "driver_locations_driver_delete" ON public.driver_locations;

CREATE POLICY "driver_locations_participant_select" ON public.driver_locations
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = user_id 
    OR EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = driver_locations.booking_id 
        AND (b.user_id = (select auth.uid()) OR b.owner_id = (select auth.uid()))
    )
  );

CREATE POLICY "driver_locations_driver_insert" ON public.driver_locations
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id 
    AND EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = driver_locations.booking_id AND b.user_id = (select auth.uid())
    )
  );

CREATE POLICY "driver_locations_driver_update" ON public.driver_locations
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "driver_locations_driver_delete" ON public.driver_locations
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'driver_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
  END IF;
END $$;

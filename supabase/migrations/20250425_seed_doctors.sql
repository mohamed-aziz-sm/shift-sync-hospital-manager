
-- Helper function to seed doctors without foreign key constraint issues
CREATE OR REPLACE FUNCTION public.seed_doctors(doctors jsonb[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Temporarily disable the foreign key constraint
  ALTER TABLE public.doctors DISABLE TRIGGER ALL;
  
  -- Insert doctors with a placeholder user_id
  FOR i IN 1..array_length(doctors, 1) LOOP
    INSERT INTO public.doctors (
      name,
      email,
      specialty,
      group_id,
      user_id
    ) VALUES (
      (doctors[i]->>'name')::text,
      (doctors[i]->>'email')::text,
      (doctors[i]->>'specialty')::text,
      (doctors[i]->>'group_id')::int,
      '00000000-0000-0000-0000-000000000000'::uuid
    );
  END LOOP;
  
  -- Re-enable constraints
  ALTER TABLE public.doctors ENABLE TRIGGER ALL;
END;
$$;

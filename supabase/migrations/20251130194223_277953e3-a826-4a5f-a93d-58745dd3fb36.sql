-- Add foreign key from user_roles to profiles to enable PostgREST joins
ALTER TABLE public.user_roles
ADD CONSTRAINT fk_user_roles_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
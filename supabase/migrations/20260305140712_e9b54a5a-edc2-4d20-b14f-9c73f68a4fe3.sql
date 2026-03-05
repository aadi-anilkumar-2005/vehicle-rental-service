
-- Owner can assign 'staff' role to users they own in the staff table
CREATE OR REPLACE FUNCTION public.owner_assign_staff_role(_staff_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Verify the caller owns a staff record for this user
    IF NOT EXISTS (
        SELECT 1 FROM public.staff
        WHERE user_id = _staff_user_id AND owner_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized: you do not own this staff member';
    END IF;
    
    -- Update role to staff
    UPDATE public.user_roles SET role = 'staff' WHERE user_id = _staff_user_id;
END;
$function$;

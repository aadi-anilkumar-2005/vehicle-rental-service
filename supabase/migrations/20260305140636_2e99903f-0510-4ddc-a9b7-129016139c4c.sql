
-- 1. Fix handle_new_user trigger: ALWAYS assign 'user' role, ignore client metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email
    );
    
    -- Always assign 'user' role. Elevated roles must be granted by an admin.
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$function$;

-- 2. Admin RPC to set user role (secured with SECURITY DEFINER + admin check)
CREATE OR REPLACE FUNCTION public.admin_set_user_role(_target_user_id uuid, _role app_role)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Only admins can call this
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: only admins can assign roles';
    END IF;
    
    -- Upsert the role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_target_user_id, _role)
    ON CONFLICT (user_id, role) DO UPDATE SET role = _role;
END;
$function$;

-- 3. Server-side booking price validation trigger
CREATE OR REPLACE FUNCTION public.validate_booking_price()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_price_per_hour numeric;
    v_price_per_day numeric;
    v_duration_hours numeric;
    v_duration_days numeric;
    v_min_price numeric;
BEGIN
    -- Fetch vehicle pricing
    SELECT price_per_hour, price_per_day INTO v_price_per_hour, v_price_per_day
    FROM public.vehicles WHERE id = NEW.vehicle_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vehicle not found';
    END IF;
    
    -- Calculate duration
    v_duration_hours := EXTRACT(EPOCH FROM (NEW.end_date - NEW.start_date)) / 3600.0;
    v_duration_days := v_duration_hours / 24.0;
    
    -- Calculate minimum price (use whichever rate gives the lower legitimate price)
    IF v_duration_hours <= 24 THEN
        v_min_price := CEIL(v_duration_hours) * v_price_per_hour;
    ELSE
        v_min_price := CEIL(v_duration_days) * v_price_per_day;
    END IF;
    
    -- Reject if submitted price is less than the minimum vehicle cost
    IF NEW.total_price < v_min_price THEN
        RAISE EXCEPTION 'Invalid total price: submitted % is below minimum %', NEW.total_price, v_min_price;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_booking_price_trigger
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_booking_price();

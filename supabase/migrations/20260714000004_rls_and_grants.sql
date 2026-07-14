-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Admins policy
-- Không có INSERT, UPDATE, DELETE cho admin từ client. Thêm xóa thông qua SQL Editor/Service Role.
CREATE POLICY "Admins can read own record" ON public.admins FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Categories policy
CREATE POLICY "Public read visible categories" ON public.categories FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin full access categories" ON public.categories TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Shop Info policy
CREATE POLICY "Public read shop_info" ON public.shop_info FOR SELECT USING (true);
CREATE POLICY "Admin full access shop_info" ON public.shop_info TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Menu Items policy
CREATE POLICY "Public read visible menu_items" ON public.menu_items FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin full access menu_items" ON public.menu_items TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Reservations policy
-- REVOKE ALL từ public/anon
REVOKE ALL ON public.reservations FROM anon;
REVOKE ALL ON public.reservations FROM authenticated;

-- Khách chỉ tạo bằng RPC. Admin thì được phép thao tác toàn bộ
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;

CREATE POLICY "Admin full access reservations" ON public.reservations TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- RPC for Reservation
CREATE OR REPLACE FUNCTION public.create_reservation(
    p_customer_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_reservation_date DATE,
    p_reservation_time TIME,
    p_guest_count INT,
    p_customer_note TEXT
) RETURNS UUID AS $$
DECLARE
    v_new_id UUID;
    v_name_trimmed TEXT := trim(p_customer_name);
    v_phone_trimmed TEXT := trim(p_phone);
    v_email_trimmed TEXT := trim(p_email);
    v_note_trimmed TEXT := trim(p_customer_note);
BEGIN
    -- Validations
    IF v_name_trimmed = '' THEN
        RAISE EXCEPTION 'Tên không được để trống.';
    END IF;
    IF length(v_name_trimmed) < 2 THEN
        RAISE EXCEPTION 'Tên phải có ít nhất 2 ký tự.';
    END IF;
    IF length(v_name_trimmed) > 100 THEN
        RAISE EXCEPTION 'Tên không được vượt quá 100 ký tự.';
    END IF;
    
    IF v_phone_trimmed = '' OR v_phone_trimmed !~ '^[0-9+\s()-]{8,15}$' THEN
        RAISE EXCEPTION 'Số điện thoại không hợp lệ.';
    END IF;
    
    IF v_email_trimmed IS NOT NULL AND length(v_email_trimmed) > 100 THEN
        RAISE EXCEPTION 'Email không được vượt quá 100 ký tự.';
    END IF;

    IF p_reservation_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Ngày đặt bàn không được ở trong quá khứ.';
    END IF;

    IF p_guest_count < 1 OR p_guest_count > 20 THEN
        RAISE EXCEPTION 'Số khách phải từ 1 đến 20.';
    END IF;
    
    IF v_note_trimmed IS NOT NULL AND length(v_note_trimmed) > 500 THEN
        RAISE EXCEPTION 'Ghi chú không được vượt quá 500 ký tự.';
    END IF;

    -- Forced safe values for internal fields
    INSERT INTO public.reservations (
        customer_name,
        phone,
        email,
        reservation_date,
        reservation_time,
        guest_count,
        customer_note,
        status,
        notification_status,
        internal_note
    ) VALUES (
        v_name_trimmed,
        v_phone_trimmed,
        v_email_trimmed,
        p_reservation_date,
        p_reservation_time,
        p_guest_count,
        v_note_trimmed,
        'PENDING',
        'PENDING',
        NULL
    ) RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE ALL ON FUNCTION public.create_reservation FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_reservation TO anon;
GRANT EXECUTE ON FUNCTION public.create_reservation TO authenticated;

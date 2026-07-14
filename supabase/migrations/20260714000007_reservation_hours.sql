-- Thêm cấu hình giờ nhận khách vào shop_info
ALTER TABLE public.shop_info 
ADD COLUMN reservation_start_time TIME NOT NULL DEFAULT '07:30',
ADD COLUMN reservation_end_time TIME NOT NULL DEFAULT '21:00';

-- Cập nhật RPC create_reservation
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
    v_start_time TIME;
    v_end_time TIME;
    v_now_vn TIMESTAMPTZ := now() AT TIME ZONE 'Asia/Ho_Chi_Minh';
BEGIN
    -- Kiểm tra spam (Chỉ cho phép 1 request/phút/sdt)
    IF EXISTS (
        SELECT 1 FROM public.reservations 
        WHERE phone = v_phone_trimmed 
        AND created_at > (now() - interval '1 minute')
    ) THEN
        RAISE EXCEPTION 'Vui lòng đợi 1 phút trước khi gửi yêu cầu mới.';
    END IF;

    -- Lấy cấu hình giờ
    SELECT reservation_start_time, reservation_end_time 
    INTO v_start_time, v_end_time 
    FROM public.shop_info LIMIT 1;

    -- Validations cơ bản
    IF v_name_trimmed = '' THEN
        RAISE EXCEPTION 'Tên không được để trống.';
    END IF;
    IF length(v_name_trimmed) < 2 THEN
        RAISE EXCEPTION 'Tên phải có ít nhất 2 ký tự.';
    END IF;
    IF length(v_name_trimmed) > 100 THEN
        RAISE EXCEPTION 'Tên không được vượt quá 100 ký tự.';
    END IF;
    
    -- Phone regex: 10 chữ số, bắt đầu bằng 0 hoặc +84
    IF v_phone_trimmed !~ '^(0|\+84)[0-9]{9}$' THEN
        RAISE EXCEPTION 'Số điện thoại không hợp lệ.';
    END IF;
    
    IF v_email_trimmed IS NOT NULL AND length(v_email_trimmed) > 100 THEN
        RAISE EXCEPTION 'Email không được vượt quá 100 ký tự.';
    END IF;

    IF p_guest_count < 1 OR p_guest_count > 20 THEN
        RAISE EXCEPTION 'Số khách phải từ 1 đến 20.';
    END IF;
    
    IF v_note_trimmed IS NOT NULL AND length(v_note_trimmed) > 500 THEN
        RAISE EXCEPTION 'Ghi chú không được vượt quá 500 ký tự.';
    END IF;

    -- Validate thời gian (Múi giờ VN)
    IF p_reservation_date < v_now_vn::date THEN
        RAISE EXCEPTION 'Ngày đặt bàn không được ở trong quá khứ.';
    END IF;

    IF p_reservation_time < v_start_time OR p_reservation_time > v_end_time THEN
        RAISE EXCEPTION 'Giờ đặt bàn phải nằm trong khoảng từ % đến %.', v_start_time, v_end_time;
    END IF;

    IF p_reservation_date = v_now_vn::date AND p_reservation_time < v_now_vn::time THEN
        RAISE EXCEPTION 'Không thể đặt bàn ở thời điểm trong quá khứ.';
    END IF;

    IF EXTRACT(minute FROM p_reservation_time) NOT IN (0, 30) THEN
        RAISE EXCEPTION 'Khung giờ đặt bàn phải chẵn mỗi 30 phút.';
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

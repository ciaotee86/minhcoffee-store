INSERT INTO public.shop_info (shop_name, address, phone, opening_hours)
VALUES ('Cà phê Minh', '123 Nguyễn Thiện Thuật, Quận 3', '028 3999 1234', '{}'::jsonb)
ON CONFLICT DO NOTHING;

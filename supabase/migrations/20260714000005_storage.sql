-- Tạo bucket lưu trữ ảnh (yêu cầu insert extension nếu chưa có)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'menu-images', 
  'menu-images', 
  true, 
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET 
  public = true, 
  file_size_limit = 2097152, 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies
-- Khách được phép đọc ảnh public
CREATE POLICY "Public read access for menu-images" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');

-- Chỉ Admin thực sự thông qua public.is_admin() được phép ghi/xóa/sửa
CREATE POLICY "Admin insert for menu-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu-images' AND public.is_admin());
CREATE POLICY "Admin update for menu-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'menu-images' AND public.is_admin());
CREATE POLICY "Admin delete for menu-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'menu-images' AND public.is_admin());

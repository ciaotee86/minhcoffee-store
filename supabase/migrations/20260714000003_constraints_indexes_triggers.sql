-- Constraints
ALTER TABLE public.shop_info ADD CONSTRAINT single_row_check CHECK (is_singleton = true);
CREATE UNIQUE INDEX shop_info_singleton_idx ON public.shop_info(is_singleton);

ALTER TABLE public.categories ADD CONSTRAINT categories_key_not_empty CHECK (trim(key) <> '');
ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_price_positive CHECK (price > 0);
ALTER TABLE public.reservations ADD CONSTRAINT reservations_guests_range CHECK (guest_count >= 1 AND guest_count <= 20);
ALTER TABLE public.reservations ADD CONSTRAINT reservations_customer_name_not_empty CHECK (trim(customer_name) <> '');
ALTER TABLE public.reservations ADD CONSTRAINT reservations_phone_not_empty CHECK (trim(phone) <> '');

-- Indexes
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_visible_sort ON public.menu_items(is_visible, sort_order);
CREATE INDEX idx_menu_items_featured_visible ON public.menu_items(id) WHERE is_featured = true AND is_visible = true;
CREATE INDEX idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX idx_reservations_status_date ON public.reservations(status, reservation_date);
CREATE INDEX idx_reservations_created_at ON public.reservations(created_at);

-- Triggers
CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();
CREATE TRIGGER update_shop_info_modtime BEFORE UPDATE ON public.shop_info FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();
CREATE TRIGGER update_menu_items_modtime BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();
CREATE TRIGGER update_reservations_modtime BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();
CREATE TRIGGER sync_reservation_timestamps_trigger BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE PROCEDURE public.sync_reservation_timestamps();

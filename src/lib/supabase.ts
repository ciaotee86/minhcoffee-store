import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

<<<<<<< HEAD
export type Category = {
  id: string;
  key: string;
  label: string;
  is_visible: boolean;
  sort_order: number;
};

export type ShopInfo = {
  id: string;
  shop_name: string;
  introduction: string | null;
  address: string;
  phone: string;
  email: string | null;
  zalo_link: string | null;
  facebook_link: string | null;
  instagram_link: string | null;
  maps_link: string | null;
  parking_note: string | null;
  opening_hours: Record<string, any>;
  reservation_notification_email: string | null;
  hero_image_url: string | null;
  is_singleton: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_url: string | null;
  is_visible: boolean;
  is_available: boolean;
  is_featured: boolean;
=======
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'tea' | 'pastry';
  image_url: string;
  available: boolean;
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
  sort_order: number;
};

export type Reservation = {
  id: string;
<<<<<<< HEAD
  customer_name: string;
  phone: string;
  email: string | null;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  customer_note: string | null;
  internal_note: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notification_status: 'PENDING' | 'SENT' | 'FAILED';
  notification_error: string | null;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
};

export async function uploadImage(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    const ext = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) return { url: null, error: error.message };
    
    const { data: publicUrlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName);
      
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message };
  }
}
=======
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  note: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
};

export type ReservationInput = Omit<Reservation, 'id' | 'status' | 'created_at'>;
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171

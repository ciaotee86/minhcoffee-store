import { useEffect, useState } from 'react';
import { supabase, type ShopInfo } from '../lib/supabase';

export function SeoStructuredData() {
  const [shop, setShop] = useState<ShopInfo | null>(null);

  useEffect(() => {
    supabase.from('shop_info').select('*').limit(1).maybeSingle().then(({ data }) => {
      if (data) setShop(data);
    });
  }, []);

  if (!shop) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "name": shop.shop_name || "Cà phê Minh",
    "image": shop.hero_image_url || "https://images.pexels.com/photos/34994685/pexels-photo-34994685.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "url": "https://caphe-minh.vn/",
    "telephone": shop.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": shop.address,
      "addressLocality": "Quận 3",
      "addressRegion": "Hồ Chí Minh",
      "addressCountry": "VN"
    },
    "description": shop.introduction || "Cà phê Minh nằm trong hẻm nhỏ Quận 3. Không gian yên tĩnh phù hợp làm việc, gặp gỡ bạn bè.",
    "servesCuisine": "Coffee, Tea, Cake",
    "acceptsReservations": "True",
    "priceRange": "$",
    "sameAs": [
      shop.facebook_link,
      shop.instagram_link,
      shop.zalo_link,
      shop.maps_link
    ].filter(Boolean)
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
    />
  );
}

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Reveal } from './Reveal';
import { CoffeeRing } from './CoffeeRing';
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { supabase, type ShopInfo } from '../lib/supabase';

export function Contact() {
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('shop_info').select('*').limit(1).maybeSingle();
      if (!error && data) {
        setShop(data as ShopInfo);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <section id="contact" className="py-section bg-cream-light/60 min-h-[400px]" />;
  }

  // Fallback to empty strings if no DB record
  const phone = shop?.phone || '';
  const phoneDisplay = phone;
  const zaloLink = shop?.zalo_link || '';
  const mapsLink = shop?.maps_link || '';
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(shop?.address || '')}&output=embed`;

=======
import { Reveal } from './Reveal';
import { CoffeeRing } from './CoffeeRing';
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';

const PHONE = '02839991234';
const PHONE_DISPLAY = '028 3999 1234';
const ZALO_LINK = 'https://zalo.me/84901234567';
const MAPS_LINK = 'https://maps.google.com/?q=123+Nguyen+Thien+Thuat+Quan+3+HCM';

export function Contact() {
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
  return (
    <section id="contact" className="relative py-section bg-cream-light/60">
      <CoffeeRing size={280} className="absolute -bottom-10 right-10 text-coffee" opacity={0.05} rotate={-12} />

      <div className="mx-auto max-w-site px-5 md:px-8">
        <Reveal>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-serif text-7xl md:text-8xl text-coffee/10 font-medium leading-none">06</span>
            <span className="text-xs uppercase tracking-[0.12em] text-orange font-semibold">
              Địa chỉ & giờ mở cửa
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
          {/* Map — left, offset */}
          <Reveal delay={1} className="col-span-12 md:col-span-7">
            <div className="relative cut-corner overflow-hidden border border-coffee/15 bg-beige-light">
              <iframe
<<<<<<< HEAD
                title={`Bản đồ vị trí ${shop?.shop_name || 'Cà phê Minh'}`}
                src={mapEmbedUrl}
=======
                title="Bản đồ vị trí Cà phê Minh"
                src="https://www.google.com/maps?q=Nguyen+Thien+Thuat+Quan+3+Ho+Chi+Minh&output=embed"
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
                className="w-full h-[320px] md:h-[440px] grayscale-[30%] sepia-[20%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>

          {/* Info — right */}
          <div className="col-span-12 md:col-span-5 md:col-start-8 mt-2 md:mt-4">
            <Reveal delay={2}>
              <h2 className="font-serif text-coffee text-h2 font-medium mb-8">
                Ghé quán ở
                <span className="hand-underline">
<<<<<<< HEAD
                  {' '} Quận 3
=======
                  {' '}Quận 3
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
                  <svg viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 8 Q 25 2 50 7 T 98 6" />
                  </svg>
                </span>.
              </h2>
            </Reveal>

            <Reveal delay={2}>
              <div className="space-y-6">
                <InfoRow icon={<MapPin size={18} />} label="Địa chỉ">
<<<<<<< HEAD
                  {shop?.address}
                </InfoRow>
                <InfoRow icon={<Clock size={18} />} label="Giờ mở cửa">
                  {Object.entries(shop?.opening_hours || {}).length > 0
                    ? Object.entries(shop!.opening_hours).map(([key, val]) => (
                      <div key={key}>{key}: {String(val)}</div>
                    ))
                    : 'Chưa cập nhật'}
                </InfoRow>
                <InfoRow icon={<Phone size={18} />} label="Điện thoại">
                  <a href={`tel:+84${phone.replace(/^0/, '')}`} className="link-hand text-coffee hover:text-orange transition-colors">
                    {phoneDisplay}
=======
                  123 Nguyễn Thiện Thuật, Phường 2, Quận 3, TP. HCM
                </InfoRow>
                <InfoRow icon={<Clock size={18} />} label="Giờ mở cửa">
                  Thứ 2 — Chủ nhật: 7:00 — 21:30
                </InfoRow>
                <InfoRow icon={<Phone size={18} />} label="Điện thoại">
                  <a href={`tel:+84${PHONE}`} className="link-hand text-coffee hover:text-orange transition-colors">
                    {PHONE_DISPLAY}
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
                  </a>
                </InfoRow>
              </div>
            </Reveal>

            {/* Note about parking */}
            <Reveal delay={3}>
              <div className="mt-6 paper-note p-4 max-w-sm rotate-[1deg]">
                <p className="font-hand text-coffee text-sm leading-snug">
<<<<<<< HEAD
                  {shop?.parking_note || 'Chỗ để xe hiện chưa được cập nhật.'}
=======
                  Có chỗ gửi xe máy ngay hẻm bên cạnh quán. Ô tô gửi ở bãi đường Cách Mạng Tháng Tám, đi bộ 3 phút.
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
                </p>
              </div>
            </Reveal>

            {/* Action buttons */}
            <Reveal delay={3}>
              <div className="mt-8 flex flex-wrap gap-3">
<<<<<<< HEAD
                {mapsLink && (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <span>Chỉ đường</span>
                  </a>
                )}
                <a href={`tel:+84${phone.replace(/^0/, '')}`} className="btn-secondary">
                  <Phone size={16} /> Gọi điện
                </a>
                {zaloLink && (
                  <a
                    href={zaloLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <MessageCircle size={16} /> Nhắn Zalo
                  </a>
                )}
=======
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <span>Chỉ đường</span>
                </a>
                <a href={`tel:+84${PHONE}`} className="btn-secondary">
                  <Phone size={16} /> Gọi điện
                </a>
                <a
                  href={ZALO_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <MessageCircle size={16} /> Nhắn Zalo
                </a>
>>>>>>> ea7ed197c9c3aa2a7875101efd1d7534e6d82171
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-sm bg-coffee/8 text-coffee shrink-0">
        {icon}
      </span>
      <div>
        <span className="block text-xs uppercase tracking-[0.1em] text-muted font-semibold mb-1">{label}</span>
        <div className="text-coffee text-base leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

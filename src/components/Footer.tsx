import { CoffeeRing } from './CoffeeRing';
import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';

export function Footer({ onNav }: { onNav: (href: string) => void }) {
  return (
    <footer className="relative overflow-hidden bg-coffee text-cream-warm pt-20 pb-10">
      {/* Large coffee ring background */}
      <CoffeeRing size={500} className="absolute -top-40 -right-40 text-cream-warm" opacity={0.05} rotate={-15} />
      <CoffeeRing size={200} className="absolute bottom-10 left-10 text-orange" opacity={0.08} rotate={20} />

      <div className="relative mx-auto max-w-site px-5 md:px-8">
        <div className="grid grid-cols-12 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="relative inline-flex items-center justify-center w-9 h-9">
                <span className="absolute inset-0 rounded-full border-2 border-cream-warm rotate-[-8deg] opacity-70" />
                <span className="font-serif text-cream-warm text-lg font-semibold relative">M</span>
              </span>
              <span className="font-serif text-xl font-semibold">
                Cà phê <span className="font-hand text-orange text-2xl">Minh</span>
              </span>
            </div>
            <p className="font-serif text-2xl md:text-3xl font-medium leading-snug max-w-sm">
              "Một góc nhỏ để uống cà phê,
              <br />
              làm việc và ngồi lâu hơn một chút."
            </p>
            <p className="mt-5 text-cream-warm/60 text-sm">
              — Minh, chủ quán
            </p>
          </div>

          {/* Visit */}
          <div className="col-span-6 md:col-span-3 md:col-start-7">
            <h3 className="text-xs uppercase tracking-[0.12em] text-orange font-semibold mb-4">Ghé quán</h3>
            <p className="text-cream-warm/80 text-sm leading-relaxed">
              123 Nguyễn Thiện Thuật<br />
              Phường 2, Quận 3<br />
              TP. HCM
            </p>
            <p className="mt-4 text-cream-warm/80 text-sm leading-relaxed">
              Mở 7:00 — 21:30<br />
              Hàng ngày
            </p>
          </div>

          {/* Contact */}
          <div className="col-span-6 md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.12em] text-orange font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+842839991234" className="inline-flex items-center gap-2 text-cream-warm/80 hover:text-orange text-sm transition-colors">
                  <Phone size={14} /> 028 3999 1234
                </a>
              </li>
              <li>
                <a href="https://zalo.me/84901234567" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cream-warm/80 hover:text-orange text-sm transition-colors">
                  <MessageCircle size={14} /> Zalo
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cream-warm/80 hover:text-orange text-sm transition-colors">
                  <Facebook size={14} /> Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cream-warm/80 hover:text-orange text-sm transition-colors">
                  <Instagram size={14} /> Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-cream-warm/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream-warm/50 text-xs">
            © 2021 — 2026 Cà phê Minh. Bán cà phê, bán bánh, và giữ chỗ cho bạn ngồi.
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => onNav('#menu')}
              className="text-cream-warm/60 hover:text-orange text-xs uppercase tracking-[0.1em] transition-colors"
            >
              Menu
            </button>
            <button
              onClick={() => onNav('#reserve')}
              className="text-cream-warm/60 hover:text-orange text-xs uppercase tracking-[0.1em] transition-colors"
            >
              Đặt bàn
            </button>
            <button
              onClick={() => onNav('#admin')}
              className="text-cream-warm/30 hover:text-orange text-xs uppercase tracking-[0.1em] transition-colors"
            >
              Quản trị
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

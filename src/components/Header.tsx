import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';

const NAV = [
  { label: 'Câu chuyện', href: '#story' },
  { label: 'Menu', href: '#menu' },
  { label: 'Không gian', href: '#space' },
  { label: 'Đặt bàn', href: '#reserve' },
  { label: 'Liên hệ', href: '#contact' },
];

export function Header({ onNav }: { onNav?: (href: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    onNav?.(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-cream-warm/95 backdrop-blur-sm shadow-[0_1px_0_rgba(74,46,36,0.1)]' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-site px-5 md:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? 'py-2.5' : 'py-4'}`}>
          {/* Logo */}
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); handleNav('#top'); }}
            className="flex items-center gap-2.5 group"
            aria-label="Cà phê Minh — trang chủ"
          >
            <span className="relative inline-flex items-center justify-center w-9 h-9">
              <span className="absolute inset-0 rounded-full border-2 border-coffee rotate-[-8deg] opacity-70 transition-transform duration-500 group-hover:rotate-[-4deg]" />
              <span className="absolute inset-1.5 rounded-full border border-orange rotate-[-4deg] opacity-50" />
              <span className="font-serif text-coffee text-lg font-semibold relative">M</span>
            </span>
            <span className="font-serif text-coffee text-lg md:text-xl font-semibold leading-none">
              Cà phê <span className="font-hand text-orange text-xl md:text-2xl">Minh</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Điều hướng chính">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNav(item.href); }}
                className="link-hand text-sm font-medium text-coffee hover:text-orange transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+842839991234"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-coffee hover:text-orange transition-colors"
              aria-label="Gọi điện cho quán"
            >
              <Phone size={15} />
              <span className="hidden lg:inline">028 3999 1234</span>
            </a>
            <a
              href="#reserve"
              onClick={(e) => { e.preventDefault(); handleNav('#reserve'); }}
              className="hidden sm:inline-flex items-center text-sm font-medium text-cream-warm bg-coffee px-4 py-2 rounded-l-sm rounded-r-2xl hover:bg-orange transition-colors duration-300"
            >
              Đặt bàn
            </a>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex flex-col gap-1.5 p-2 -mr-2"
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={open}
            >
              <span className={`block w-5 h-0.5 bg-coffee transition-transform duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block w-5 h-0.5 bg-coffee transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-coffee transition-transform duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-cream-warm border-t border-coffee/10 animate-fade-in">
          <nav className="px-5 py-4 flex flex-col gap-1" aria-label="Điều hướng di động">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); handleNav(item.href); }}
                className="py-2.5 text-base font-medium text-coffee hover:text-orange transition-colors border-b border-coffee/5 last:border-0"
              >
                {item.label}
              </a>
            ))}
            <a
              href="tel:+842839991234"
              className="mt-2 inline-flex items-center gap-2 text-base font-medium text-orange"
            >
              <Phone size={16} /> 028 3999 1234
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

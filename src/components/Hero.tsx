import { CoffeeRing } from './CoffeeRing';
import { Reveal } from './Reveal';

const HERO_MAIN = 'https://images.pexels.com/photos/34994685/pexels-photo-34994685.jpeg?auto=compress&cs=tinysrgb&w=800';
const HERO_SUB1 = 'https://images.pexels.com/photos/30442504/pexels-photo-30442504.jpeg?auto=compress&cs=tinysrgb&w=500';
const HERO_SUB2 = 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=500';

export function Hero({ onNav }: { onNav: (href: string) => void }) {
  return (
    <section id="top" className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
      {/* Background coffee ring */}
      <CoffeeRing size={420} className="absolute -top-20 -left-32 text-coffee" opacity={0.08} rotate={-12} />
      <CoffeeRing size={180} className="absolute top-1/2 right-10 text-orange" opacity={0.1} rotate={15} />

      <div className="mx-auto max-w-site px-5 md:px-8">
        <div className="grid grid-cols-12 gap-6 md:gap-8 items-center">
          {/* Left: headline */}
          <div className="col-span-12 md:col-span-6 lg:col-span-5 relative z-10">
            <Reveal>
              <span className="inline-block text-xs font-sans uppercase tracking-[0.12em] text-orange font-semibold mb-5">
                Quận 3 · Mở 7:00 — 21:30
              </span>
            </Reveal>

            <Reveal delay={1}>
              <h1 className="font-serif text-coffee text-hero font-medium">
                Một góc nhỏ
                <br />
                để <span className="hand-underline">
                  <span className="font-hand text-orange text-[0.85em] font-normal">ngồi lại</span>
                  <svg viewBox="0 0 120 14" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 8 Q 30 2 60 7 T 118 6" />
                  </svg>
                </span>{' '}
                lâu hơn
                <br />
                một chút.
              </h1>
            </Reveal>

            <Reveal delay={2}>
              <p className="mt-6 text-lg text-muted max-w-md leading-relaxed">
                Cà phê Minh nằm trong một con hẻm nhỏ của Quận 3 — chỗ để uống cà phê,
                làm việc, gặp bạn, hoặc chỉ ngồi yên và để buổi trưa trôi chậm hơn.
              </p>
            </Reveal>

            <Reveal delay={3}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button onClick={() => onNav('#menu')} className="btn-primary">
                  <span>Xem menu</span>
                </button>
                <button onClick={() => onNav('#reserve')} className="btn-secondary">
                  Đặt bàn trước
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right: collage */}
          <div className="col-span-12 md:col-span-6 lg:col-span-7 relative mt-10 md:mt-0">
            <Reveal delay={2} className="relative">
              <div className="relative grid grid-cols-12 gap-3 md:gap-4">
                {/* Main image */}
                <div className="col-span-8 md:col-span-8 relative">
                  <div className="cut-corner-tr overflow-hidden border border-coffee/15 bg-beige-light">
                    <img
                      src={HERO_MAIN}
                      alt="Cận cảnh ly cà phê sữa đá trên mặt bàn gỗ, ánh sáng ấm chiếu qua cửa sổ"
                      className="w-full h-[280px] md:h-[420px] object-cover"
                      loading="eager"
                      fetchPriority="high"
                    />
                  </div>
                  {/* Note tag */}
                  <div className="absolute -bottom-3 -left-3 md:-left-5 paper-note px-3 py-2 rotate-[-3deg] max-w-[180px]">
                    <p className="font-hand text-coffee text-sm leading-tight">
                      "Lát này ngon nhất khi vừa pha xong."
                    </p>
                  </div>
                </div>

                {/* Sub images */}
                <div className="col-span-4 md:col-span-4 flex flex-col gap-3 md:gap-4">
                  <div className="overflow-hidden border border-coffee/15 bg-beige-light rotate-[2deg]">
                    <img
                      src={HERO_SUB1}
                      alt="Tay cầm ly latte có hình nghệ thuật bọt sữa"
                      className="w-full h-[130px] md:h-[200px] object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="overflow-hidden border border-coffee/15 bg-beige-light rotate-[-2deg]">
                    <img
                      src={HERO_SUB2}
                      alt="Cốc cà phê đen trên bàn gỗ, ánh sáng tự nhiên"
                      className="w-full h-[130px] md:h-[200px] object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Floating price-tag accent */}
              <div className="absolute top-2 -right-1 md:top-4 md:right-2 z-10 rotate-[6deg]">
                <span className="price-tag">từ 32k</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Hand divider */}
      <div className="mt-16 md:mt-24 px-5 md:px-8">
        <div className="mx-auto max-w-site hand-divider" />
      </div>
    </section>
  );
}

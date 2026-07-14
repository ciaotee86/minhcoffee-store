import { Reveal } from './Reveal';
import { CoffeeRing } from './CoffeeRing';

const IMAGES = [
  {
    url: 'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Góc nhìn vào không gian quán, bàn gỗ dài, ánh sáng ấm',
    caption: 'Khu ngồi chung',
    note: 'Bàn gỗ dài, ghế tựa lưng — ngồi làm việc cả buổi cũng không mỏi.',
    span: 'lg:col-span-7',
    height: 'h-[360px] md:h-[460px]',
    rotate: 'rotate-[-0.5deg]',
  },
  {
    url: 'https://images.pexels.com/photos/31332842/pexels-photo-31332842.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Bàn gần cửa sổ, nắng chiếu vào, có người ngồi làm việc',
    caption: 'Bàn gần cửa sổ',
    note: 'Nắng lọt vào từ sáng đến trưa — chỗ ngồi được đặt trước nhiều nhất.',
    span: 'lg:col-span-5',
    height: 'h-[220px] md:h-[280px]',
    rotate: 'rotate-[1deg]',
  },
  {
    url: 'https://images.pexels.com/photos/10507830/pexels-photo-10507830.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Khu vực ngồi nhóm, vài người trò chuyện quanh bàn',
    caption: 'Khu ngồi nhóm',
    note: 'Góc trong cùng, tách tiếng ồn — hợp cho nhóm 4–6 người.',
    span: 'lg:col-span-5',
    height: 'h-[220px] md:h-[280px]',
    rotate: 'rotate-[-1.5deg]',
  },
  {
    url: 'https://images.pexels.com/photos/22873741/pexels-photo-22873741.jpeg?auto=compress&cs=tinysrgb&w=600',
    alt: 'Cận cảnh ly cà phê trên bàn, chi tiết gỗ và ánh sáng',
    caption: 'Quầy pha chế',
    note: 'Ngồi ngay quầy nếu thích xem barista pha từng ly.',
    span: 'lg:col-span-7',
    height: 'h-[360px] md:h-[460px]',
    rotate: 'rotate-[0.5deg]',
  },
];

export function Space() {
  return (
    <section id="space" className="relative py-section">
      <CoffeeRing size={200} className="absolute top-20 right-0 text-coffee" opacity={0.05} rotate={20} />

      <div className="mx-auto max-w-site px-5 md:px-8">
        <Reveal>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-serif text-7xl md:text-8xl text-coffee/10 font-medium leading-none">03</span>
            <span className="text-xs uppercase tracking-[0.12em] text-orange font-semibold">
              Không gian quán
            </span>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <h2 className="font-serif text-coffee text-h2 font-medium max-w-2xl mb-10 md:mb-14">
            Bạn sẽ ngồi ở đâu khi
            <span className="hand-underline">
              {' '}đến quán
              <svg viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8 Q 25 2 50 7 T 98 6" />
              </svg>
            </span>?
          </h2>
        </Reveal>

        {/* Asymmetric strip */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {IMAGES.map((img, i) => (
            <Reveal
              key={i}
              delay={((i % 3) + 1) as 1 | 2 | 3}
              className={`col-span-12 ${img.span}`}
            >
              <figure className={`relative ${img.rotate}`}>
                <div className="cut-corner overflow-hidden border border-coffee/15 bg-beige-light">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className={`w-full ${img.height} object-cover transition-transform duration-700 hover:scale-[1.03]`}
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-3 flex items-start gap-3">
                  <span className="font-hand text-orange text-lg leading-none mt-0.5">{img.caption}</span>
                  <span className="text-sm text-muted leading-snug max-w-xs">{img.note}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

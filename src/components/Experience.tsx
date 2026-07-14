import { Reveal } from './Reveal';
import { CoffeeRing } from './CoffeeRing';

const BLOCKS = [
  {
    title: 'Làm việc',
    keyword: 'yên tĩnh',
    body: 'Wifi nhanh, bàn rộng, ổ cắm đủ dùng. Buổi sáng yên nhất — đến từ 7:30 để có chỗ cạnh cửa sổ.',
    img: 'https://images.pexels.com/photos/33505093/pexels-photo-33505093.jpeg?auto=compress&cs=tinysrgb&w=700',
    alt: 'Người ngồi làm việc với laptop trong quán cà phê, ánh sáng tự nhiên',
    align: 'left',
  },
  {
    title: 'Gặp bạn',
    keyword: 'trò chuyện',
    body: 'Khu trong cùng tách tiếng ồn, hợp cho nhóm 4–6 người ngồi lâu. Đặt trước nếu đi nhóm đông cuối tuần.',
    img: 'https://images.pexels.com/photos/36006047/pexels-photo-36006047.jpeg?auto=compress&cs=tinysrgb&w=700',
    alt: 'Hai người trẻ ngồi trò chuyện trong quán cà phê ấm cúng',
    align: 'right',
  },
  {
    title: 'Nghỉ một chút',
    keyword: 'thư giãn',
    body: 'Không cần gọi nhiều — một ly bạc xỉu và chỗ ngồi cạnh cửa sổ cũng đủ để chiều trôi chậm lại.',
    img: 'https://images.pexels.com/photos/14416476/pexels-photo-14416476.jpeg?auto=compress&cs=tinysrgb&w=700',
    alt: 'Một người cầm ly cà phê ấm, ngồi thư giãn trong quán',
    align: 'left',
  },
];

export function Experience() {
  return (
    <section className="relative py-section bg-beige-light/40">
      <CoffeeRing size={240} className="absolute bottom-20 left-10 text-orange" opacity={0.06} rotate={-10} />

      <div className="mx-auto max-w-site px-5 md:px-8">
        <Reveal>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-serif text-7xl md:text-8xl text-coffee/10 font-medium leading-none">04</span>
            <span className="text-xs uppercase tracking-[0.12em] text-orange font-semibold">
              Trải nghiệm
            </span>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <h2 className="font-serif text-coffee text-h2 font-medium max-w-2xl mb-14 md:mb-20">
            Ghé Minh vào lúc nào
            <span className="hand-underline">
              {' '}cũng được
              <svg viewBox="0 0 110 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8 Q 28 2 55 7 T 108 6" />
              </svg>
            </span>.
          </h2>
        </Reveal>

        <div className="space-y-16 md:space-y-24">
          {BLOCKS.map((block, i) => (
            <div key={i} className="grid grid-cols-12 gap-6 md:gap-10 items-center">
              {block.align === 'left' ? (
                <>
                  <Reveal delay={1} className="col-span-12 md:col-span-5">
                    <div className="relative cut-corner overflow-hidden border border-coffee/15 bg-beige-light rotate-[-1deg]">
                      <img
                        src={block.img}
                        alt={block.alt}
                        className="w-full h-[280px] md:h-[360px] object-cover transition-transform duration-700 hover:scale-[1.03]"
                        loading="lazy"
                        width="400"
                        height="360"
                      />
                    </div>
                  </Reveal>
                  <Reveal delay={2} className="col-span-12 md:col-span-6 md:col-start-7">
                    <BlockContent block={block} index={i} />
                  </Reveal>
                </>
              ) : (
                <>
                  <Reveal delay={1} className="col-span-12 md:col-span-6 md:order-2">
                    <div className="relative cut-corner-bl overflow-hidden border border-coffee/15 bg-beige-light rotate-[1deg]">
                      <img
                        src={block.img}
                        alt={block.alt}
                        className="w-full h-[280px] md:h-[360px] object-cover transition-transform duration-700 hover:scale-[1.03]"
                        loading="lazy"
                        width="400"
                        height="360"
                      />
                    </div>
                  </Reveal>
                  <Reveal delay={2} className="col-span-12 md:col-span-5 md:col-start-1 md:order-1">
                    <BlockContent block={block} index={i} />
                  </Reveal>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockContent({ block, index }: { block: typeof BLOCKS[0]; index: number }) {
  return (
    <div className="relative">
      <span className="font-serif text-6xl text-coffee/8 font-medium leading-none block mb-3">
        0{index + 1}
      </span>
      <h3 className="font-serif text-coffee text-3xl md:text-4xl font-medium leading-tight">
        {block.title}{' '}
        <span className="font-hand text-orange text-2xl md:text-3xl font-normal">
          — {block.keyword}
        </span>
      </h3>
      <p className="mt-5 text-lg text-muted leading-relaxed max-w-md">{block.body}</p>
    </div>
  );
}

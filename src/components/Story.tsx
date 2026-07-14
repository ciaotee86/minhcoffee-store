import { CoffeeRing } from './CoffeeRing';
import { Reveal } from './Reveal';

const STORY_IMG = 'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=900';

export function Story() {
  return (
    <section id="story" className="relative py-section">
      <CoffeeRing size={260} className="absolute top-10 right-5 md:right-20 text-coffee" opacity={0.06} rotate={10} />

      <div className="mx-auto max-w-site px-5 md:px-8">
        {/* Section number */}
        <Reveal>
          <div className="flex items-baseline gap-4 mb-12 md:mb-16">
            <span className="font-serif text-7xl md:text-8xl text-coffee/10 font-medium leading-none">01</span>
            <span className="text-xs uppercase tracking-[0.12em] text-orange font-semibold">
              Câu chuyện quán
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-12 gap-6 md:gap-10 items-start">
          {/* Image — left, spans 5 cols, offset */}
          <Reveal delay={1} className="col-span-12 md:col-span-5 md:col-start-1">
            <div className="relative">
              <div className="cut-corner overflow-hidden border border-coffee/15 bg-beige-light">
                <img
                  src={STORY_IMG}
                  alt="Góc nhìn vào không gian quán cà phê, bàn gỗ, ánh sáng chiếu qua cửa sổ"
                  className="w-full h-[320px] md:h-[480px] object-cover"
                  loading="lazy"
                />
              </div>
              {/* Handwritten note */}
              <div className="absolute -bottom-6 -right-2 md:-right-8 paper-note px-5 py-4 rotate-[3deg] max-w-[220px]">
                <p className="font-hand text-coffee text-base leading-snug">
                  "Mình mở quán không vì ước mơ lớn, chỉ muốn có chỗ ngồi thật ngon cho người quen."
                </p>
                <p className="font-hand text-orange text-sm mt-2">— Minh</p>
              </div>
            </div>
          </Reveal>

          {/* Text — right, spans 6 cols, offset by 1 */}
          <div className="col-span-12 md:col-span-6 md:col-start-7 mt-8 md:mt-12">
            <Reveal delay={2}>
              <h2 className="font-serif text-coffee text-h2 font-medium">
                Quán nhỏ, nhưng mỗi món đều
                <span className="hand-underline">
                  {' '}được làm chỉn chu
                  <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 8 Q 50 2 100 7 T 198 6" />
                  </svg>
                </span>.
              </h2>
            </Reveal>

            <Reveal delay={3}>
              <div className="mt-7 space-y-5 text-lg text-muted leading-relaxed max-w-lg">
                <p>
                  Cà phê Minh bắt đầu từ một căn nhà cũ trong hẻm Quận 3. Mình giữ lại phần gỗ,
                  mở thêm cửa sổ cho nắng lọt vào, và đặt vài chiếc bàn đủ rộng để vừa đặt laptop
                  vừa đặt ly cà phê.
                </p>
                <p>
                  Menu không dài. Mình chỉ bán những món mình uống được mỗi ngày — cà phê phin,
                  bạc xỉu, vài loại trà, và bánh nướng xong vào buổi sáng. Không cố làm mới mỗi tuần,
                  chỉ cố làm mỗi ly thật ổn.
                </p>
                <p className="text-coffee font-medium">
                  Nếu bạn ghé, hãy ngồi lâu một chút. Quán không tính tiền theo giờ.
                </p>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div className="mt-8 flex items-center gap-3 text-sm text-muted">
                <span className="inline-block w-8 h-px bg-coffee/30" />
                <span className="font-hand text-orange text-base">Mở từ tháng 3, 2021</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

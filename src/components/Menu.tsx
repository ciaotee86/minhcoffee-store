import { useEffect, useState } from 'react';
import { supabase, type MenuItem, type Category } from '../lib/supabase';
import { CoffeeRing } from './CoffeeRing';
import { Reveal } from './Reveal';

function formatPrice(price: number): string {
  return `${price}.000đ`;
}

export function Menu({ onNav }: { onNav: (href: string) => void }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const [menuRes, catRes] = await Promise.all([
        supabase.from('menu_items').select('*').order('sort_order', { ascending: true }),
        supabase.from('categories').select('*').order('sort_order', { ascending: true })
      ]);
      if (menuRes.error || catRes.error) {
        setLoading(false);
        return;
      }
      setItems((menuRes.data as MenuItem[]) || []);
      setCategories((catRes.data as Category[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = active === 'all' ? items : items.filter((i) => i.category_id === active);

  return (
    <section id="menu" className="relative py-section bg-cream-light/60">
      <CoffeeRing size={300} className="absolute -bottom-10 -left-20 text-orange" opacity={0.07} rotate={-15} />

      <div className="mx-auto max-w-site px-5 md:px-8">
        {/* Section header */}
        <Reveal>
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-serif text-7xl md:text-8xl text-coffee/10 font-medium leading-none">02</span>
            <span className="text-xs uppercase tracking-[0.12em] text-orange font-semibold">
              Menu nổi bật
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-12 gap-6 md:gap-10 items-end mb-10 md:mb-14">
          <Reveal delay={1} className="col-span-12 md:col-span-7">
            <h2 className="font-serif text-coffee text-h2 font-medium">
              Menu vừa đủ quen,
              <br />
              nhưng mỗi món đều{' '}
              <span className="hand-underline">
                được làm kỹ
                <svg viewBox="0 0 140 14" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 8 Q 35 2 70 7 T 138 6" />
                </svg>
              </span>.
            </h2>
          </Reveal>
          <Reveal delay={2} className="col-span-12 md:col-span-4 md:col-start-9">
            <p className="text-muted text-base leading-relaxed">
              Giá tính bằng nghìn đồng (VND). Quán cập nhật menu theo mùa —
              hỏi nhân viên nếu bạn muốn món đặc biệt hôm nay.
            </p>
          </Reveal>
        </div>

        {/* Filter tabs */}
        <Reveal delay={2}>
          <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Lọc menu theo loại">
            <button
              role="tab"
              aria-selected={active === 'all'}
              onClick={() => setActive('all')}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-l-sm rounded-r-xl border ${
                active === 'all'
                  ? 'bg-coffee text-cream-warm border-coffee'
                  : 'bg-transparent text-coffee border-coffee/20 hover:border-orange hover:text-orange'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active === cat.id}
                onClick={() => setActive(cat.id)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-l-sm rounded-r-xl border ${
                  active === cat.id
                    ? 'bg-coffee text-cream-warm border-coffee'
                    : 'bg-transparent text-coffee border-coffee/20 hover:border-orange hover:text-orange'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Menu grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 bg-beige-light/60 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-center py-16">Chưa có món trong mục này.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {filtered.map((item, idx) => {
              const catLabel = categories.find(c => c.id === item.category_id)?.label || 'Khác';
              return <MenuCard key={item.id} item={item} index={idx} categoryLabel={catLabel} />;
            })}
          </div>
        )}

        {/* CTA */}
        <Reveal delay={3}>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-coffee/10">
            <p className="font-hand text-coffee text-lg">
              Còn nhiều món nữa — ghé quán để xem menu đầy đủ nhé.
            </p>
            <button onClick={() => onNav('#reserve')} className="btn-primary">
              <span>Đặt bàn để giữ chỗ</span>
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MenuCard({ item, index, categoryLabel }: { item: MenuItem; index: number; categoryLabel: string }) {
  return (
    <Reveal delay={(Math.min(index, 3) + 1) as 1 | 2 | 3 | 4}>
      <article className="menu-card relative bg-cream-warm border border-coffee/12 cut-corner-tr overflow-hidden">
        {/* Image — offset, not always on top */}
        <div className={`relative overflow-hidden bg-beige-light ${index % 2 === 0 ? 'h-44' : 'h-52'}`}>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={`${item.name} - Menu Cà phê Minh Quận 3`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              loading="lazy"
              width="300"
              height="200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-coffee/5 text-coffee/30 font-serif">
              Chưa có ảnh
            </div>
          )}
          {/* Price tag */}
          <div className="absolute top-3 right-3 rotate-[4deg]">
            <span className="price-tag">{formatPrice(item.price)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-coffee text-xl font-medium leading-snug">{item.name}</h3>
          <p className="mt-2 text-sm text-muted leading-relaxed">{item.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.1em] text-olive font-semibold">
              {categoryLabel}
            </span>
            <span className="text-coffee font-semibold text-sm">{formatPrice(item.price)}</span>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

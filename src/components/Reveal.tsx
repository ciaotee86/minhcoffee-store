import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  delay?: 1 | 2 | 3 | 4;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

export function Reveal({ children, delay, className = '', as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Tag = as as any;
  return (
    <Tag
      ref={ref as any}
      className={`reveal ${inView ? 'in-view' : ''} ${className}`}
      data-delay={delay}
    >
      {children}
    </Tag>
  );
}

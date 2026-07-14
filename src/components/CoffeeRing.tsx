type RingProps = {
  size?: number;
  className?: string;
  color?: string;
  opacity?: number;
  rotate?: number;
};

export function CoffeeRing({ size = 200, className = '', color = '#4A2E24', opacity = 0.16, rotate = -8 }: RingProps) {
  return (
    <span
      className={`coffee-ring ${className}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        color,
        ['--ring-opacity' as any]: opacity,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

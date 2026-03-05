"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
  className,
}: {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let animFrame = 0;
    let animated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !animated) {
          animated = true;
          observer.disconnect();

          let start: number | null = null;
          const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) {
              animFrame = requestAnimationFrame(step);
            }
          };
          animFrame = requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animFrame);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {count}{suffix}
    </span>
  );
}

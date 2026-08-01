import { useState, useEffect, useRef } from "react";

export function useCountUp(end: number, duration = 1200, enabled = true) {
  const [value, setValue] = useState(end);
  const prevEnd = useRef(end);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!enabled || end === 0) {
      setValue(end);
      return;
    }

    if (end === prevEnd.current) return;
    prevEnd.current = end;

    const from = value;
    const startTime = performance.now();

    const step = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + eased * (end - from)));
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      }
    };

    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [end, duration, enabled]);

  return value;
}

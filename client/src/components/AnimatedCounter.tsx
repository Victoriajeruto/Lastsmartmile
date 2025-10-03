import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
  loopInterval?: number;
}

export function AnimatedCounter({ 
  end, 
  duration = 2000, 
  suffix = "", 
  decimals = 0,
  loopInterval = 3000 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const frameRef = useRef<number>();
  const loopTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const startAnimation = () => {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = end;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;
        
        countRef.current = currentValue;
        setCount(currentValue);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          // Animation completed, schedule next loop
          loopTimeoutRef.current = setTimeout(() => {
            setCount(0);
            startAnimation();
          }, loopInterval);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    };

    startAnimation();

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
      }
    };
  }, [end, duration, loopInterval]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals)
    : Math.floor(count).toString();

  return <span>{displayValue}{suffix}</span>;
}

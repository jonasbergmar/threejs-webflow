import { useState, useEffect, RefObject } from 'react';

interface Dimensions {
width: number;
height: number;
}

export function useDimensions(ref: RefObject<HTMLElement | SVGElement>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return dimensions;
}

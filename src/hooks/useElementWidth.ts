import { useLayoutEffect, useState, type RefObject } from 'react';

export function useElementWidth(
  ref: RefObject<HTMLElement | null>,
  initialWidth: number,
) {
  const [width, setWidth] = useState(initialWidth);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const applyWidth = (value: number) => {
      if (value > 0) setWidth(value);
    };

    // Measure synchronously so the first paint doesn't flash at initialWidth;
    // ResizeObserver's own first notification fires asynchronously after paint.
    const style = getComputedStyle(el);
    const paddingX =
      parseFloat(style.paddingLeft || '0') +
      parseFloat(style.paddingRight || '0');
    applyWidth(el.clientWidth - paddingX);

    const observer = new ResizeObserver((entries) => {
      applyWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

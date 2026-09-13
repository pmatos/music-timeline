import { renderHook, act } from '@testing-library/react';
import { useElementWidth } from './useElementWidth';

function refTo(el: HTMLElement | null) {
  return { current: el };
}

function withMockResizeObserver(
  run: (getCallback: () => ResizeObserverCallback | undefined) => void,
) {
  let resizeCallback: ResizeObserverCallback | undefined;
  const originalResizeObserver = globalThis.ResizeObserver;
  class MockResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeCallback = callback;
    }
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
  }
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

  try {
    run(() => resizeCallback);
  } finally {
    globalThis.ResizeObserver = originalResizeObserver;
  }
}

test('returns the initial width before measuring', () => {
  withMockResizeObserver(() => {
    const { result } = renderHook(() =>
      useElementWidth(refTo(document.createElement('div')), 1200),
    );
    expect(result.current).toBe(1200);
  });
});

test('updates the width when ResizeObserver reports a new size', () => {
  withMockResizeObserver((getCallback) => {
    const { result } = renderHook(() =>
      useElementWidth(refTo(document.createElement('div')), 1200),
    );

    act(() => {
      getCallback()?.(
        [{ contentRect: { width: 900 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      );
    });

    expect(result.current).toBe(900);
  });
});

test('ignores a non-positive width from ResizeObserver', () => {
  withMockResizeObserver((getCallback) => {
    const { result } = renderHook(() =>
      useElementWidth(refTo(document.createElement('div')), 1200),
    );

    act(() => {
      getCallback()?.(
        [{ contentRect: { width: 0 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      );
    });

    expect(result.current).toBe(1200);
  });
});

test('does nothing when the ref has no element', () => {
  const { result } = renderHook(() => useElementWidth(refTo(null), 1200));
  expect(result.current).toBe(1200);
});

import { renderHook } from '@testing-library/react';
import { useOrientation } from './useOrientation';

test('returns landscape when width > height', () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  const { result } = renderHook(() => useOrientation());
  expect(result.current).toBe('landscape');
});

test('returns portrait when height > width', () => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  const { result } = renderHook(() => useOrientation());
  expect(result.current).toBe('portrait');
});

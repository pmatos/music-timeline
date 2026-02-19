import { renderHook, act } from '@testing-library/react';
import { useTimelineScale } from './useTimelineScale';

test('yearToPixel converts year to pixel position', () => {
  const { result } = renderHook(() =>
    useTimelineScale({ startYear: 1600, endYear: 2030, containerWidth: 1000 })
  );

  const px1600 = result.current.yearToPixel(1600);
  const px2030 = result.current.yearToPixel(2030);

  expect(px1600).toBe(0);
  expect(px2030).toBeCloseTo(1000, 0);
});

test('yearToPixel scales with zoom', () => {
  const { result } = renderHook(() =>
    useTimelineScale({ startYear: 1600, endYear: 2030, containerWidth: 1000 })
  );

  const before = result.current.yearToPixel(1800);

  act(() => {
    result.current.setZoom(2);
  });

  const after = result.current.yearToPixel(1800);
  expect(after).toBeCloseTo(before * 2, 0);
});

test('totalWidth scales with zoom', () => {
  const { result } = renderHook(() =>
    useTimelineScale({ startYear: 1600, endYear: 2030, containerWidth: 1000 })
  );

  expect(result.current.totalWidth).toBe(1000);

  act(() => {
    result.current.setZoom(3);
  });

  expect(result.current.totalWidth).toBe(3000);
});

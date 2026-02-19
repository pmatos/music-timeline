import { useState, useCallback, useMemo } from 'react';

interface UseTimelineScaleOptions {
  startYear: number;
  endYear: number;
  containerWidth: number;
}

export function useTimelineScale({
  startYear,
  endYear,
  containerWidth,
}: UseTimelineScaleOptions) {
  const [zoom, setZoom] = useState(1);

  const totalWidth = containerWidth * zoom;
  const pixelsPerYear = totalWidth / (endYear - startYear);

  const yearToPixel = useCallback(
    (year: number) => (year - startYear) * pixelsPerYear,
    [startYear, pixelsPerYear]
  );

  const pixelToYear = useCallback(
    (px: number) => px / pixelsPerYear + startYear,
    [startYear, pixelsPerYear]
  );

  return useMemo(
    () => ({
      zoom,
      setZoom,
      totalWidth,
      pixelsPerYear,
      yearToPixel,
      pixelToYear,
    }),
    [zoom, setZoom, totalWidth, pixelsPerYear, yearToPixel, pixelToYear]
  );
}

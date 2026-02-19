import { useState, useEffect } from 'react';
import type { InstrumentData } from '../types';

export function useInstrumentData(instrument: string) {
  const [data, setData] = useState<InstrumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`${import.meta.env.BASE_URL}data/${instrument}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${instrument} data`);
        return res.json();
      })
      .then((json: InstrumentData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [instrument]);

  return { data, loading, error };
}

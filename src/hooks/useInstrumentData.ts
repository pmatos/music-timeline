import { useState, useEffect, useRef } from 'react';
import type { InstrumentData, InstrumentConfig, Person, Connection } from '../types';

export function useInstrumentData(instrument: string) {
  const [data, setData] = useState<InstrumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ people: Person[]; connections: Connection[] } | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);

    const base = import.meta.env.BASE_URL;

    const fetchShared = cacheRef.current
      ? Promise.resolve(cacheRef.current)
      : Promise.all([
          fetch(`${base}data/people.json`).then((res) => {
            if (!res.ok) throw new Error('Failed to load people data');
            return res.json() as Promise<Person[]>;
          }),
          fetch(`${base}data/connections.json`).then((res) => {
            if (!res.ok) throw new Error('Failed to load connections data');
            return res.json() as Promise<Connection[]>;
          }),
        ]).then(([people, connections]) => {
          const shared = { people, connections };
          cacheRef.current = shared;
          return shared;
        });

    const fetchConfig = fetch(`${base}data/${instrument}.json`).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${instrument} data`);
      return res.json() as Promise<InstrumentConfig>;
    });

    Promise.all([fetchShared, fetchConfig])
      .then(([shared, config]) => {
        const idSet = new Set(config.peopleIds);
        const people = shared.people.filter((p) => idSet.has(p.id));
        const connections = shared.connections.filter(
          (c) => idSet.has(c.from) && idSet.has(c.to),
        );

        setData({
          instrument: config.instrument,
          eras: config.eras,
          people,
          connections,
        });
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [instrument]);

  return { data, loading, error };
}

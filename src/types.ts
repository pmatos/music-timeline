export type Role = 'composer' | 'player' | 'both';

export type ConnectionType = 'relative' | 'student-teacher';

export interface Era {
  name: string;
  startYear: number;
  endYear: number;
  color: string;
}

export interface Person {
  id: string;
  name: string;
  born: number;
  bornEstimated?: boolean;
  died: number | null;
  role: Role;
  bio: string;
  photoUrl: string | null;
  wikiUrl: string | null;
  websiteUrl: string | null;
}

export interface Connection {
  from: string;
  to: string;
  type: ConnectionType;
  label?: string;
}

export interface InstrumentData {
  instrument: string;
  eras: Era[];
  people: Person[];
  connections: Connection[];
}

export interface InstrumentConfig {
  instrument: string;
  eras: Era[];
  peopleIds: string[];
}

import type { InstrumentData, Person, Connection, Era, InstrumentConfig } from './types';

test('InstrumentData structure is valid', () => {
  const data: InstrumentData = {
    instrument: 'Piano',
    eras: [
      { name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' },
    ],
    people: [
      {
        id: 'bach',
        name: 'J.S. Bach',
        born: 1685,
        died: 1750,
        role: 'composer',
        bio: 'A composer.',
        photoUrl: '/images/piano/bach.jpg',
        wikiUrl: 'https://en.wikipedia.org/wiki/Johann_Sebastian_Bach',
        websiteUrl: null,
      },
    ],
    connections: [
      { from: 'bach', to: 'cpe-bach', type: 'relative', label: 'father/son' },
    ],
  };

  expect(data.instrument).toBe('Piano');
  expect(data.people).toHaveLength(1);
  expect(data.eras).toHaveLength(1);
  expect(data.connections).toHaveLength(1);
});

test('Person with null died represents living person', () => {
  const person: Person = {
    id: 'lang-lang',
    name: 'Lang Lang',
    born: 1982,
    died: null,
    role: 'player',
    bio: 'A pianist.',
    photoUrl: 'https://upload.wikimedia.org/...',
    wikiUrl: 'https://en.wikipedia.org/wiki/Lang_Lang',
    websiteUrl: 'https://www.langlangofficial.com',
  };

  expect(person.died).toBeNull();
  expect(person.websiteUrl).not.toBeNull();
});

test('InstrumentConfig structure is valid', () => {
  const config: InstrumentConfig = {
    instrument: 'Piano',
    eras: [
      { name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' },
    ],
    peopleIds: ['bach', 'beethoven'],
  };

  expect(config.instrument).toBe('Piano');
  expect(config.eras).toHaveLength(1);
  expect(config.peopleIds).toHaveLength(2);
});

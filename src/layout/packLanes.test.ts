import { packLanes } from './packLanes';
import type { Person } from '../types';

function makePerson(id: string, born: number, died: number | null): Person {
  return {
    id,
    name: id,
    born,
    died,
    role: 'composer',
    bio: '',
    photoUrl: null,
    wikiUrl: '',
    websiteUrl: null,
  };
}

test('single person goes to lane 0', () => {
  const people = [makePerson('a', 1700, 1750)];
  const result = packLanes(people, 2026);
  expect(result).toEqual([{ person: people[0], lane: 0 }]);
});

test('non-overlapping people share lane 0', () => {
  const people = [
    makePerson('a', 1700, 1750),
    makePerson('b', 1760, 1810),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].lane).toBe(0);
  expect(result[1].lane).toBe(0);
});

test('overlapping people get different lanes', () => {
  const people = [
    makePerson('a', 1700, 1780),
    makePerson('b', 1750, 1830),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].lane).toBe(0);
  expect(result[1].lane).toBe(1);
});

test('living person (died=null) uses currentYear', () => {
  const people = [
    makePerson('a', 1980, null),
    makePerson('b', 1990, null),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].lane).toBe(0);
  expect(result[1].lane).toBe(1);
});

test('three overlapping people get three lanes', () => {
  const people = [
    makePerson('a', 1700, 1800),
    makePerson('b', 1720, 1810),
    makePerson('c', 1740, 1790),
  ];
  const result = packLanes(people, 2026);
  const lanes = result.map((r) => r.lane);
  expect(lanes).toEqual([0, 1, 2]);
});

test('people are sorted by birth year in output', () => {
  const people = [
    makePerson('b', 1800, 1850),
    makePerson('a', 1700, 1750),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].person.id).toBe('a');
  expect(result[1].person.id).toBe('b');
});

test('adds gap between bars in same lane', () => {
  const people = [
    makePerson('a', 1700, 1749),
    makePerson('b', 1750, 1800),
  ];
  const result = packLanes(people, 2026);
  expect(result[0].lane).toBe(0);
  expect(result[1].lane).toBe(0);
});

import { render } from '@testing-library/react';
import { GenderSummary } from './GenderSummary';
import type { Person, Gender } from '../types';

function person(id: string, gender?: Gender): Person {
  return {
    id,
    name: id,
    born: 1800,
    died: 1850,
    role: 'composer',
    gender,
    bio: '',
    photoUrl: null,
    wikiUrl: null,
    websiteUrl: null,
  };
}

test('counts women, men, and unrecorded with pluralization', () => {
  const people = [
    person('a', 'female'),
    person('b', 'male'),
    person('c', 'male'),
    person('d'),
  ];
  const { container } = render(<GenderSummary people={people} />);
  expect(container.textContent).toBe(
    '4 people · 1 woman · 2 men · 1 unrecorded',
  );
});

test('omits zero categories', () => {
  const { container } = render(
    <GenderSummary people={[person('a', 'male'), person('b', 'male')]} />,
  );
  expect(container.textContent).toBe('2 people · 2 men');
});

test('handles a single person', () => {
  const { container } = render(
    <GenderSummary people={[person('a', 'female')]} />,
  );
  expect(container.textContent).toBe('1 person · 1 woman');
});

import {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from '@testing-library/react';
import App from './App';
import type { Person, Connection, InstrumentConfig } from './types';

const mockPeople: Person[] = [
  {
    id: 'bach',
    name: 'J.S. Bach',
    born: 1685,
    died: 1750,
    role: 'composer',
    bio: 'A composer.',
    photoUrl: null,
    wikiUrl: '',
    websiteUrl: null,
  },
];

const mockConnections: Connection[] = [];

const mockPianoConfig: InstrumentConfig = {
  instrument: 'Piano',
  eras: [{ name: 'Baroque', startYear: 1600, endYear: 1750, color: '#E3F2FD' }],
  peopleIds: ['bach'],
};

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes('people.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPeople),
      });
    }
    if (url.includes('connections.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockConnections),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockPianoConfig),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders header with instrument name after loading', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('Piano Music Timeline')).toBeInTheDocument();
  });
});

test('renders header feedback links after loading', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/suggest a person/i)).toBeInTheDocument();
  });
  expect(screen.getByText(/report a correction/i)).toBeInTheDocument();
  expect(screen.getByText(/feedback/i)).toBeInTheDocument();
});

test('shows a loading status before data arrives', () => {
  render(<App />);
  expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
});

test('renders a main landmark and a skip-timeline link', async () => {
  render(<App />);
  await screen.findByText('Piano Music Timeline');
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /skip timeline/i }),
  ).toBeInTheDocument();
});

test('opens a person dialog on click and closes it', async () => {
  render(<App />);
  const bar = await screen.findByRole('button', { name: /J\.S\. Bach/ });
  fireEvent.click(bar);
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('J.S. Bach')).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Close details'));
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
});

test('shows an error state with a working retry when loading fails', async () => {
  const failing = vi.fn(() =>
    Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
  );
  global.fetch = failing as unknown as typeof fetch;

  render(<App />);
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent(/couldn.?t load/i);

  const callsBefore = failing.mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: /try again/i }));
  await waitFor(() =>
    expect(failing.mock.calls.length).toBeGreaterThan(callsBefore),
  );
});

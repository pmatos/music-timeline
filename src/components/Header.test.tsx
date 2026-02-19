import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

test('displays instrument name in title', () => {
  render(<Header instrument="Piano" instruments={['piano', 'violin']} onInstrumentChange={() => {}} />);
  expect(screen.getByText('Piano Music Timeline')).toBeInTheDocument();
});

test('displays sponsor link', () => {
  render(<Header instrument="Piano" instruments={['piano']} onInstrumentChange={() => {}} />);
  const link = screen.getByText('Rightkey.app');
  expect(link).toHaveAttribute('href', 'https://rightkey.app');
});

test('renders instrument selector', () => {
  render(<Header instrument="Piano" instruments={['piano', 'violin']} onInstrumentChange={() => {}} />);
  const select = screen.getByRole('combobox');
  expect(select).toBeInTheDocument();
});

test('calls onInstrumentChange when selection changes', () => {
  const onChange = vi.fn();
  render(<Header instrument="Piano" instruments={['piano', 'violin']} onInstrumentChange={onChange} />);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'violin' } });
  expect(onChange).toHaveBeenCalledWith('violin');
});

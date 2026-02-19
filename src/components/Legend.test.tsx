import { render, screen } from '@testing-library/react';
import { Legend } from './Legend';

test('shows connection type labels', () => {
  render(<Legend />);
  expect(screen.getByText('Relative')).toBeInTheDocument();
  expect(screen.getByText('Student/Teacher')).toBeInTheDocument();
});

test('shows role labels', () => {
  render(<Legend />);
  expect(screen.getByText('Composer')).toBeInTheDocument();
  expect(screen.getByText('Player')).toBeInTheDocument();
  expect(screen.getByText('Both')).toBeInTheDocument();
});

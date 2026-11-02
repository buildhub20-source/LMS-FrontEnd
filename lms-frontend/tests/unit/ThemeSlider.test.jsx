import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import ThemeProvider from '../../src/app/providers/ThemeProvider';
import ThemeSlider from '../../src/components/common/ThemeSlider/ThemeSlider';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('light', 'dark');
  delete document.documentElement.dataset.theme;
});

it('switches both ways and restores the chosen theme on remount', () => {
  localStorage.setItem('lms-theme', 'dark');
  const view = render(
    <ThemeProvider>
      <ThemeSlider />
    </ThemeProvider>,
  );
  fireEvent.click(screen.getByRole('switch', { name: 'Switch to light mode' }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(screen.getByRole('switch', { name: 'Switch to dark mode' })).toHaveAttribute(
    'aria-checked',
    'false',
  );
  fireEvent.click(screen.getByRole('switch', { name: 'Switch to dark mode' }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  view.unmount();
  render(
    <ThemeProvider>
      <ThemeSlider />
    </ThemeProvider>,
  );
  expect(screen.getByRole('switch', { name: 'Switch to light mode' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  expect(document.documentElement).toHaveClass('dark');
});

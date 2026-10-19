import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from '../../../src/components/common/Button';

describe('Button icons', () => {
  it('renders icon aliases without forwarding them to the DOM', () => {
    render(
      <Button iconLeft={<span>Left</span>} iconRight={<span>Right</span>}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('LeftSaveRight');
    expect(button).not.toHaveAttribute('iconLeft');
    expect(button).not.toHaveAttribute('iconRight');
  });

  it('prefers canonical icon props when both forms are provided', () => {
    render(
      <Button leftIcon={<span>Canonical</span>} iconLeft={<span>Alias</span>}>
        Save
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveTextContent('CanonicalSave');
    expect(screen.queryByText('Alias')).not.toBeInTheDocument();
  });

  it('shows a busy, disabled button instead of the action icons while loading', () => {
    render(
      <Button isLoading iconLeft={<span>Left</span>} iconRight={<span>Right</span>}>
        Save
      </Button>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Left')).not.toBeInTheDocument();
    expect(screen.queryByText('Right')).not.toBeInTheDocument();
  });
});

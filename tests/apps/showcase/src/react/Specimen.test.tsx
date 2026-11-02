import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Specimen } from '../../../../../apps/showcase/src/react/Specimen';
import { SPECIMEN_SECTIONS } from '../../../../../apps/showcase/src/specimen';

describe('React Specimen', () => {
  it('renders every section', () => {
    render(<Specimen />);
    for (const title of Object.values(SPECIMEN_SECTIONS)) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  });

  it('toggles the pressed button', async () => {
    render(<Specimen />);
    const toggle = screen.getByRole('button', { name: 'Toggle' });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('updates the name readout while typing', async () => {
    render(<Specimen />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), 'x');
    expect(screen.getByText('7 / 24')).toBeInTheDocument();
  });

  it('removes a chip', async () => {
    render(<Specimen />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove charge' }),
    );
    expect(screen.queryByRole('button', { name: 'Remove charge' })).toBeNull();
  });

  it('steps the progress value', async () => {
    render(<Specimen />);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByRole('progressbar', { name: 'Budget' })).toHaveAttribute(
      'aria-valuetext',
      '7 of 10',
    );
  });
});

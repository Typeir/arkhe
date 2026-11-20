import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ChoiceSection } from '../../../../../apps/showcase/src/react/ChoiceSection';

describe('React ChoiceSection', () => {
  it('shows pips and boxes in every size', () => {
    render(<ChoiceSection />);
    for (const size of ['s', 'm', 'l']) {
      expect(
        screen.getByRole('checkbox', { name: `Pip ${size}` }),
      ).not.toBeChecked();
      expect(
        screen.getByRole('checkbox', { name: `Box ${size}` }),
      ).toBeChecked();
    }
  });

  it('reads mixed until every spell is picked', async () => {
    render(<ChoiceSection />);
    const all = screen.getByRole<HTMLInputElement>('checkbox', {
      name: 'All spells',
    });
    expect(all.indeterminate).toBe(true);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Ember' }));
    expect(all.indeterminate).toBe(false);
    expect(all).toBeChecked();
    await userEvent.click(all);
    expect(screen.getByRole('checkbox', { name: 'Frost' })).not.toBeChecked();
  });
  it('reports the chosen units from the segmented group', async () => {
    render(<ChoiceSection />);
    expect(screen.getByText('Units: metric')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Stride' }));
    expect(screen.getByText('Units: stride')).toBeInTheDocument();
  });
  it('reports pressed aspects and clears them', async () => {
    render(<ChoiceSection />);
    expect(screen.getByText('Aspects: tide')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fire' }));
    expect(screen.getByText('Aspects: tide, fire')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText('Aspects: none')).toBeInTheDocument();
  });
});

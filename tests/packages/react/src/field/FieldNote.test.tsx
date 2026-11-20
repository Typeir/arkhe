import { fieldIds } from '@arkhe/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FieldNote } from '../../../../../packages/react/src/field/FieldNote';

const IDS = fieldIds('note');

describe('FieldNote', () => {
  it('shows the hint under its id, or nothing', () => {
    const { container, rerender } = render(<FieldNote ids={IDS} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<FieldNote ids={IDS} hint='Pick one' />);
    expect(screen.getByText('Pick one')).toHaveAttribute('id', 'note-hint');
  });

  it('shows the error instead of the hint and announces it', async () => {
    render(<FieldNote ids={IDS} hint='Pick one' error='Required' />);
    expect(screen.queryByText('Pick one')).toBeNull();
    expect(
      screen.getByText('Required', { selector: '[data-part="error"]' }),
    ).toHaveAttribute('id', 'note-error');
    expect(
      await screen.findByText('Required', {
        selector: '[data-politeness="polite"] > div',
      }),
    ).toBeInTheDocument();
  });
});

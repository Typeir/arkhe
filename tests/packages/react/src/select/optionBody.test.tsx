import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { optionBody } from '../../../../../packages/react/src/select/optionBody';

describe('optionBody', () => {
  it('renders the label, then the description, under the list scope', () => {
    const { container } = render(
      <>
        {optionBody(
          { value: 'fire', label: 'Fireball', description: 'Burns' },
          'select',
        )}
      </>,
    );
    const label = container.querySelector('[data-part="item-label"]');
    const description = container.querySelector(
      '[data-part="item-description"]',
    );
    expect(label).toHaveTextContent('Fireball');
    expect(label).toHaveAttribute('data-scope', 'select');
    expect(description).toHaveTextContent('Burns');
  });

  it('leaves out the description and icon when the option has none', () => {
    const { container } = render(
      <>{optionBody({ value: 'frost', label: 'Frost' }, 'combobox')}</>,
    );
    expect(
      container.querySelector(
        '[data-scope="combobox"][data-part="item-label"]',
      ),
    ).toHaveTextContent('Frost');
    expect(
      container.querySelector('[data-part="item-description"]'),
    ).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });
});

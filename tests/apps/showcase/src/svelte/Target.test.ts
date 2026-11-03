import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Target from '../../../../../apps/showcase/src/svelte/Target.svelte';
import { SPECIMEN_SECTIONS } from '../../../../../apps/showcase/src/specimen';

describe('Svelte Target', () => {
  it('renders the specimen under a provider', () => {
    render(Target);
    for (const title of Object.values(SPECIMEN_SECTIONS)) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
    expect(document.querySelector('[data-live-announcer]')).not.toBeNull();
  });
});

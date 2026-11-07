/**
 * @fileoverview A card holding a card, with quick close delays, and text
 * outside both: the React twin of `svelte/NestedCardsQuick.svelte`.
 *
 * @module tests/fixtures/react/NestedCards
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { HoverCard } from '@arkhe/react';
import type { JSX } from 'react';

/**
 * Renders the Charge card, whose body holds the Action card, and an
 * `elsewhere` span.
 *
 * @component
 * @returns {JSX.Element} Both cards and the outside text.
 */
export const NestedCards = (): JSX.Element => (
  <>
    <HoverCard
      title='Charge'
      openDelay={0}
      closeDelay={50}
      content={
        <HoverCard
          title='Action'
          content='One per turn.'
          openDelay={0}
          closeDelay={50}>
          act
        </HoverCard>
      }>
      charge
    </HoverCard>
    <span>elsewhere</span>
  </>
);

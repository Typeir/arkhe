/**
 * @fileoverview Hooks a hover card up to core `CardDrag` while it is open,
 * and answers its move menu. Inputs are getters, so the effect follows only
 * the open state and the ids, never `detached`, which changes mid-drag. Not
 * exported: HoverCard uses it.
 *
 * @module packages/svelte/src/hint/cardDrag.svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import {
  type ArkheLabels,
  CardDrag,
  elementById,
  formatLabel,
  isCorner,
  MOVE_BACK,
  moveMenu,
  type RootNode,
} from '@arkhe/core';

/**
 * What HoverCard hands useCardDrag, each read when needed.
 *
 * @interface CardDragInput
 * @property {() => boolean} open - The card is open.
 * @property {() => string} contentId - Id of the card.
 * @property {() => string} triggerId - Id of its trigger.
 * @property {() => RootNode} getRootNode - Root the card lives in.
 * @property {() => boolean} detached - The card is detached now.
 * @property {(on: boolean) => void} setDetached - Detaches (pinning too) or returns the card.
 * @property {() => void} pin - Pins the card.
 * @property {() => string} title - Card title, for announcements.
 * @property {() => ArkheLabels} labels - Resolved labels.
 * @property {(text: string) => void} announce - Speaks a move.
 */
export interface CardDragInput {
  readonly open: () => boolean;
  readonly contentId: () => string;
  readonly triggerId: () => string;
  readonly getRootNode: () => RootNode;
  readonly detached: () => boolean;
  readonly setDetached: (on: boolean) => void;
  readonly pin: () => void;
  readonly title: () => string;
  readonly labels: () => ArkheLabels;
  readonly announce: (text: string) => void;
}

/**
 * Drags the open card and answers its move menu. Call during component
 * initialisation.
 *
 * @function useCardDrag
 * @param {CardDragInput} input - Card, state and labels.
 * @returns {(value: string) => void} Handles a move menu choice.
 */
export function useCardDrag(input: CardDragInput): (value: string) => void {
  let drag: CardDrag | null = null;
  $effect(() => {
    const [open, contentId, triggerId] = [
      input.open(),
      input.contentId(),
      input.triggerId(),
    ];
    if (!open) return undefined;
    const card = () => elementById(input.getRootNode(), contentId);
    const instance = new CardDrag({
      card,
      trigger: () => elementById(input.getRootNode(), triggerId),
      frame: () => card()?.closest<HTMLElement>('[data-part="frame"]') ?? null,
      header: () =>
        card()?.querySelector<HTMLElement>('[data-part="header"]') ?? null,
      grip: () =>
        card()?.querySelector<HTMLElement>(
          '[data-scope="menu"][data-part="trigger"]',
        ) ?? null,
      detached: input.detached,
      detach: () => {
        input.setDetached(true);
      },
      pin: input.pin,
      moved: () => {
        input.announce(
          formatLabel(input.labels().cardMoved, { label: input.title() }),
        );
      },
    });
    drag = instance;
    const stop = instance.attach();
    return () => {
      stop();
      drag = null;
    };
  });
  return (value: string) => {
    if (value === MOVE_BACK) {
      input.setDetached(false);
    } else if (isCorner(value)) {
      drag?.moveToCorner(value);
    }
    const labels = input.labels();
    const place = moveMenu(labels, true).find(
      (entry) => 'value' in entry && entry.value === value,
    );
    if (place && 'label' in place) {
      input.announce(
        formatLabel(labels.cardMovedTo, {
          label: input.title(),
          place: place.label,
        }),
      );
    }
  };
}

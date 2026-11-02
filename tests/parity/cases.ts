/**
 * @fileoverview Parity cases: each names a scene both ports render the same
 * way (`ReactCases.tsx`, `SvelteCases.svelte`) and the steps run on both.
 * After every step the two DOMs must match once normalised.
 *
 * @module tests/parity/cases
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { fireEvent, screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import type { Tolerance } from './normalize';

/**
 * One interaction, run identically on both ports.
 *
 * @interface ParityStep
 * @property {string} label - What the step does.
 * @property {() => Promise<unknown>} run - Performs it.
 */
export interface ParityStep {
  readonly label: string;
  readonly run: () => Promise<unknown>;
}

/**
 * A scene, its steps, and the differences it accepts.
 *
 * @interface ParityCase
 * @property {string} name - Scene name, shared by both case files.
 * @property {readonly ParityStep[]} [steps] - Interactions after the first render.
 * @property {readonly Tolerance[]} [tolerances] - Accepted differences; none by default.
 */
export interface ParityCase {
  readonly name: string;
  readonly steps?: readonly ParityStep[];
  readonly tolerances?: readonly Tolerance[];
}

/**
 * Sets an input's text one character at a time through `input` events,
 * which both frameworks read the same way.
 *
 * @function enterText
 * @param {HTMLElement} input - Text input.
 * @param {string} text - Text to enter.
 * @returns {void}
 */
export function enterText(input: HTMLElement, text: string): void {
  for (let end = 1; end <= text.length; end += 1) {
    fireEvent.input(input, { target: { value: text.slice(0, end) } });
  }
}

/**
 * Step: click the element with `role` and accessible `name`.
 *
 * @function click
 * @param {string} name - Accessible name.
 * @param {string} [role] - ARIA role. Defaults to `button`.
 * @returns {ParityStep} Step.
 */
function click(name: string, role = 'button'): ParityStep {
  return {
    label: `click ${name}`,
    run: () => userEvent.click(screen.getByRole(role, { name })),
  };
}

/**
 * Step: press keys, in user-event notation.
 *
 * @function press
 * @param {string} keys - Keys, e.g. `{Escape}`.
 * @returns {ParityStep} Step.
 */
function press(keys: string): ParityStep {
  return { label: `press ${keys}`, run: () => userEvent.keyboard(keys) };
}

/**
 * Step: hover the button with accessible `name`.
 *
 * @function hover
 * @param {string} name - Accessible name.
 * @returns {ParityStep} Step.
 */
function hover(name: string): ParityStep {
  return {
    label: `hover ${name}`,
    run: () => userEvent.hover(screen.getByRole('button', { name })),
  };
}

/**
 * Every parity case, in render order.
 *
 * @constant PARITY_CASES
 * @type {readonly ParityCase[]}
 */
export const PARITY_CASES: readonly ParityCase[] = [
  { name: 'buttons', steps: [click('Toggle')] },
  { name: 'chips' },
  { name: 'fields' },
  { name: 'icons' },
  { name: 'progress' },
  { name: 'skeleton' },
  { name: 'status' },
  {
    name: 'numeric',
    steps: [click('Increase Speed'), click('Decrease Speed')],
  },
  {
    name: 'numeric-controlled',
    steps: [
      click('Set 8'),
      {
        label: 'focus and type "710"',
        run: async () => {
          const input = screen.getByRole('spinbutton');
          await userEvent.click(input);
          for (const text of ['7', '71', '710']) {
            fireEvent.input(input, { target: { value: text } });
            await new Promise((resolve) => setTimeout(resolve));
          }
        },
      },
      press('{Tab}'),
    ],
  },
  { name: 'tabs', steps: [click('Notes', 'tab')] },
  {
    name: 'duplicates',
    steps: [click('Notes', 'tab'), click('Spell', 'combobox')],
  },
  { name: 'modal', steps: [click('Open'), press('{Escape}')] },
  { name: 'tooltip', steps: [hover('resistance')] },
  { name: 'hover-card', steps: [hover('charge'), click('Pin Charge')] },
  { name: 'popover', steps: [click('Filters'), press('{Escape}')] },
  { name: 'menu', steps: [click('Actions'), press('{ArrowDown}')] },
  {
    name: 'combobox',
    steps: [
      click('Spell', 'combobox'),
      {
        label: 'type "fr"',
        run: async () => enterText(screen.getByRole('combobox'), 'fr'),
      },
      press('{Enter}'),
    ],
  },
];

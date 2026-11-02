import {
  act,
  cleanup as cleanupReact,
  render as renderReact,
} from '@testing-library/react';
import {
  cleanup as cleanupSvelte,
  render as renderSvelte,
} from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { PARITY_CASES, type ParityCase } from './cases';
import { normalizeDom, type Tolerance } from './normalize';
import { ReactCases } from './ReactCases';
import SvelteCases from './SvelteCases.svelte';

const SHARED_TOLERANCES: readonly Tolerance[] = [
  {
    pattern: /^\s*<svg .*class="lucide /,
    reason:
      "Glyph markup is the icon set's, not Arkhé's: @lucide/svelte adds a lucide-icon class that lucide-react does not. Apps replace the art anyway.",
  },
];

interface Port {
  readonly mount: (name: string) => void;
  readonly settle: () => Promise<void>;
  readonly unmount: () => void;
}

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 30));

const REACT: Port = {
  mount: (name) => void renderReact(<ReactCases name={name} />),
  settle: () => act(wait),
  unmount: cleanupReact,
};

const SVELTE: Port = {
  mount: (name) => void renderSvelte(SvelteCases, { name }),
  settle: wait,
  unmount: cleanupSvelte,
};

async function snapshots(port: Port, scene: ParityCase): Promise<string[][]> {
  port.mount(scene.name);
  await port.settle();
  const tolerances = [...SHARED_TOLERANCES, ...(scene.tolerances ?? [])];
  const shots = [normalizeDom(document.body, tolerances)];
  for (const step of scene.steps ?? []) {
    await step.run();
    await port.settle();
    shots.push(normalizeDom(document.body, tolerances));
  }
  port.unmount();
  document.body.replaceChildren();
  return shots;
}

describe('React and Svelte render the same DOM', () => {
  for (const scene of PARITY_CASES) {
    it(scene.name, async () => {
      const react = await snapshots(REACT, scene);
      const svelte = await snapshots(SVELTE, scene);
      const missing = (shot: string[]) =>
        shot.some((line) => line.includes(`missing scene ${scene.name}`));
      expect(missing(react[0]), `${scene.name}: no React scene`).toBe(false);
      expect(missing(svelte[0]), `${scene.name}: no Svelte scene`).toBe(false);
      const labels = [
        'first render',
        ...(scene.steps ?? []).map((s) => s.label),
      ];
      react.slice(1).forEach((shot, index) => {
        expect(
          shot,
          `${scene.name}: "${labels[index + 1]}" changed nothing`,
        ).not.toEqual(react[index]);
      });
      labels.forEach((label, index) => {
        expect(svelte[index], `${scene.name} after ${label}`).toEqual(
          react[index],
        );
      });
    });
  }
});

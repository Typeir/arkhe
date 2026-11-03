/**
 * @fileoverview Svelte side of the MDX harness, the way an island ships: a
 * Vite server compiles the page for SSR and `svelte/server` renders it with
 * no DOM globals; the test's own client build then hydrates that markup.
 *
 * @module tests/mdx/sveltePage
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';
import { flushSync, hydrate, unmount, type Component } from 'svelte';
import { createServer, type ViteDevServer } from 'vite';
import { vi } from 'vitest';
import Page from './svelte/Page.svelte';

/**
 * Scenes the Svelte page renders.
 *
 * @typedef {'lineage' | 'sheet' | 'dense'} SceneName
 */
export type SceneName = 'lineage' | 'sheet' | 'dense';

/**
 * A hydrated Svelte page.
 *
 * @interface SveltePage
 * @property {string} html - Server markup.
 * @property {HTMLElement} container - Hydrated container, in the body.
 * @property {() => void} unmount - Unmounts and removes the container.
 */
export interface SveltePage {
  readonly html: string;
  readonly container: HTMLElement;
  readonly unmount: () => void;
}

const ALIAS = {
  '@arkhe/core/fx': resolve('packages/core/src/fx/index.ts'),
  '@arkhe/core': resolve('packages/core/src/index.ts'),
  '@arkhe/svelte': resolve('packages/svelte/src/index.ts'),
};

let server: ViteDevServer | undefined;

/**
 * Starts the SSR compiler once.
 *
 * @function ssr
 * @returns {Promise<ViteDevServer>} Vite server in middleware mode.
 */
async function ssr(): Promise<ViteDevServer> {
  server ??= await createServer({
    configFile: false,
    root: resolve('.'),
    logLevel: 'silent',
    appType: 'custom',
    plugins: [svelte()],
    resolve: { alias: ALIAS },
    ssr: { noExternal: ['@zag-js/svelte', '@lucide/svelte'] },
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  return server;
}

/**
 * Stops the SSR compiler.
 *
 * @function stopSsr
 * @returns {Promise<void>} Resolves once closed.
 */
export async function stopSsr(): Promise<void> {
  await server?.close();
  server = undefined;
}

/**
 * Server-renders a scene with `window` and `document` gone.
 *
 * @function svelteServerHtml
 * @param {SceneName} name - Scene.
 * @returns {Promise<string>} Markup.
 */
export async function svelteServerHtml(name: SceneName): Promise<string> {
  const vite = await ssr();
  const { render } = await vite.ssrLoadModule('svelte/server');
  const page = await vite.ssrLoadModule('/tests/mdx/svelte/Page.svelte');
  vi.stubGlobal('window', undefined);
  vi.stubGlobal('document', undefined);
  try {
    return render(page.default, { props: { name } }).body as string;
  } finally {
    vi.unstubAllGlobals();
  }
}

/**
 * Server-renders a scene, then hydrates it with the client build.
 *
 * @function hydrateSvelte
 * @param {SceneName} name - Scene.
 * @returns {Promise<SveltePage>} Markup, container, teardown.
 */
export async function hydrateSvelte(name: SceneName): Promise<SveltePage> {
  const html = await svelteServerHtml(name);
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  const app = hydrate(Page as Component<{ name: SceneName }>, {
    target: container,
    props: { name },
  });
  flushSync();
  return {
    html,
    container,
    unmount: () => {
      void unmount(app);
      container.remove();
    },
  };
}

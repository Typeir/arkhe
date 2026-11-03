/**
 * @fileoverview React side of the MDX harness: compiles a source, renders
 * the page to a string with no DOM globals, puts the markup in a container
 * and hydrates the same tree there, collecting recoverable errors.
 *
 * @module tests/mdx/reactPage
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { ArkheProvider } from '@arkhe/react';
import { act } from '@testing-library/react';
import type { MDXContent } from 'mdx/types';
import type { ReactNode } from 'react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { onServer } from './audit';
import { MDX_COMPONENTS, RouterLink } from './components';
import { compileMdx } from './pipeline';

/**
 * A hydrated page.
 *
 * @interface HydratedPage
 * @property {string} html - Server markup.
 * @property {HTMLElement} container - Hydrated container, in the body.
 * @property {unknown[]} errors - Every `onRecoverableError` call.
 * @property {() => Promise<void>} unmount - Unmounts and removes the container.
 */
export interface HydratedPage {
  readonly html: string;
  readonly container: HTMLElement;
  readonly errors: unknown[];
  readonly unmount: () => Promise<void>;
}

/**
 * Wraps compiled content the way the app's layout does.
 *
 * @function page
 * @param {MDXContent} Content - Compiled MDX.
 * @returns {ReactNode} Page tree.
 */
function page(Content: MDXContent): ReactNode {
  return (
    <ArkheProvider link={RouterLink} effects={false}>
      <article>
        <Content components={MDX_COMPONENTS} />
      </article>
    </ArkheProvider>
  );
}

/**
 * Server-renders a source.
 *
 * @function serverHtml
 * @param {string} source - MDX text.
 * @returns {Promise<string>} Markup.
 */
export async function serverHtml(source: string): Promise<string> {
  const tree = page(await compileMdx(source));
  return onServer(() => renderToString(tree));
}

/**
 * Mounts a root in a fresh container in the body.
 *
 * @function attach
 * @param {(container: HTMLElement) => Root} mount - Creates the root.
 * @param {string} [html] - Server markup to seed the container with.
 * @returns {Promise<{ container: HTMLElement; unmount: () => Promise<void> }>} Container and teardown.
 */
async function attach(
  mount: (container: HTMLElement) => Root,
  html = '',
): Promise<{ container: HTMLElement; unmount: () => Promise<void> }> {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  let root: Root | undefined;
  await act(async () => {
    root = mount(container);
  });
  const unmount = async () => {
    await act(async () => root?.unmount());
    container.remove();
  };
  return { container, unmount };
}

/**
 * Server-renders a source, then hydrates it.
 *
 * @function hydratePage
 * @param {string} source - MDX text.
 * @returns {Promise<HydratedPage>} Markup, container, errors, teardown.
 */
export async function hydratePage(source: string): Promise<HydratedPage> {
  const tree = page(await compileMdx(source));
  const html = onServer(() => renderToString(tree));
  const errors: unknown[] = [];
  const mounted = await attach(
    (container) =>
      hydrateRoot(container, tree, {
        onRecoverableError: (error) => errors.push(error),
      }),
    html,
  );
  return { html, errors, ...mounted };
}

/**
 * Renders a source on the client only, with no server markup.
 *
 * @function clientPage
 * @param {string} source - MDX text.
 * @returns {Promise<{ container: HTMLElement; unmount: () => Promise<void> }>} Container and teardown.
 */
export async function clientPage(
  source: string,
): Promise<{ container: HTMLElement; unmount: () => Promise<void> }> {
  const tree = page(await compileMdx(source));
  return attach((container) => {
    const root = createRoot(container);
    root.render(tree);
    return root;
  });
}

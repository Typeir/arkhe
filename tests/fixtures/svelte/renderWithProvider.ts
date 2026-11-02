/**
 * @fileoverview Renders a Svelte component under test inside an ArkheProvider.
 *
 * @module tests/fixtures/svelte/renderWithProvider
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import type { ArkheProvider } from '@arkhe/svelte';
import { render } from '@testing-library/svelte';
import type { Component, ComponentProps } from 'svelte';
import WithProvider from './WithProvider.svelte';

/**
 * Provider props without the subtree.
 *
 * @typedef {Omit<ComponentProps<typeof ArkheProvider>, 'children'>} ProviderProps
 */
export type ProviderProps = Omit<
  ComponentProps<typeof ArkheProvider>,
  'children'
>;

/**
 * Renders `component` with `props` below a provider built from `provider`.
 *
 * @function renderWithProvider
 * @template {Record<string, unknown>} P
 * @param {ProviderProps} provider - Provider props.
 * @param {Component<P>} component - Component under test.
 * @param {P} props - Its props.
 * @returns {ReturnType<typeof render>} Render result.
 */
export function renderWithProvider<P extends Record<string, unknown>>(
  provider: ProviderProps,
  component: Component<P>,
  props: P,
): ReturnType<typeof render> {
  const Wrapper = WithProvider as unknown as Component<{
    provider: ProviderProps;
    component: Component<P>;
    innerProps: P;
  }>;
  return render(Wrapper, { provider, component, innerProps: props });
}

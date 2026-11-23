<!--
@component
Renders a tab list and its panels on Zag's tabs machine. Panels come from the
`panel` snippet, called per value, or, for Astro, which cannot pass a
parameterised snippet, from one named slot per value. `value` binds; a
function binding vetoes. A value from the host that matches no enabled tab
shows the first enabled tab and warns once. A value the tabs chose themselves
moves there silently, and writes the binding, when its tab is removed or
disabled.
-->
<script module lang="ts">
  import type { TabItem, TabsLook } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of Tabs. Extra props named after a value are that value's slot.
   *
   * @interface TabsProps
   * @property {readonly TabItem[]} items - Tabs, in order; a repeated value is dropped.
   * @property {string} label - Accessible name of the tab list.
   * @property {string} [value] - Selected value; bindable.
   * @property {string} [defaultValue] - First value when uncontrolled.
   * @property {(value: string) => void} [onValueChange] - Reports selection changes.
   * @property {Snippet<[string]>} [panel] - Renders the panel for a value.
   * @property {TabsLook} [look] - `line`: triggers on a rule. `folder`: drawer tabs that alternate grounds as they nest. Defaults to `line`.
   */
  export interface TabsProps {
    items: readonly TabItem[];
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    panel?: Snippet<[string]>;
    look?: TabsLook;
    [slot: string]: unknown;
  }
</script>

<script lang="ts">
  import {
    ARKHE_CLASS,
    findablePanels,
    flag,
    staleTabFallback,
    tabsLayer,
    tabsMachineProps,
    uniqueByValue,
  } from '@arkhe/core';
  import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
  import * as tabs from '@zag-js/tabs';
  import { untrack } from 'svelte';
  import { useArkheEnvironment } from '../base/environment.js';
  import { provideTabsGround, useTabsGround } from './tabsGround.js';

  let {
    items,
    label,
    value = $bindable(),
    defaultValue,
    onValueChange,
    panel,
    look = 'line',
    ...slots
  }: TabsProps = $props();
  const id = $props.id();
  const env = useArkheEnvironment();
  const ground = useTabsGround();
  const placed = $derived(tabsLayer(look, ground()));
  provideTabsGround(() => placed.inner);
  const shown = $derived(uniqueByValue(items));
  const warned = new Set<string>();
  let chosen = $state<string | null>(null);
  const own = () => value === undefined || value === chosen;
  const current = () => {
    const held = value ?? chosen ?? undefined;
    return held !== undefined && own()
      ? (staleTabFallback(held, shown) ?? held)
      : held;
  };
  const commit = (next: string) => {
    chosen = next;
    value = next;
    onValueChange?.(next);
  };
  const service = useMachine(tabs.machine, () =>
    tabsMachineProps({
      id,
      items: shown,
      label,
      value: current(),
      defaultValue,
      onValueChange: commit,
      warned,
      getRootNode: env().getRootNode,
    }),
  );
  const api = $derived(tabs.connect(service, normalizeProps));
  $effect(() => {
    if (!own()) return;
    const fallback = staleTabFallback(value ?? chosen ?? api.value, shown);
    if (fallback !== null) commit(fallback);
  });
  const slotFor = (key: string) => slots[key] as Snippet | undefined;
</script>

<div
  {...mergeProps(api.getRootProps(), { class: ARKHE_CLASS })}
  data-look={look}
  data-layer={placed.layer}
  {@attach (root) =>
    findablePanels(root, (next) => {
      untrack(() => {
        api.setValue(next);
      });
    })}>
  <div {...api.getListProps()}>
    {#each shown as item (item.value)}
      <button
        {...api.getTriggerProps({ value: item.value, disabled: item.disabled })}
        >{item.label}</button>
    {/each}
    <div {...api.getIndicatorProps()}></div>
  </div>
  {#each shown as item (item.value)}
    <div
      {...api.getContentProps({ value: item.value })}
      data-value={item.value}
      data-findable={flag(!item.disabled)}>
      {#if panel}{@render panel(item.value)}{:else}{@render slotFor(
          item.value,
        )?.()}{/if}
    </div>
  {/each}
</div>

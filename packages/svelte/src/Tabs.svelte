<!--
@component
Renders a tab list and its panels on Zag's tabs machine. Panels come from the
`panel` snippet, called per value, or, for Astro, which cannot pass a
parameterised snippet, from one named slot per value. A value that matches no
enabled tab shows the first enabled tab and warns once.
-->
<script lang="ts">
  import { ARKHE_CLASS, tabsMachineProps, type TabItem } from '@arkhe/core';
  import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
  import * as tabs from '@zag-js/tabs';
  import type { Snippet } from 'svelte';
  import { useArkheEnvironment } from './environment.js';

  /**
   * Props of Tabs. Extra props named after a value are that value's slot.
   *
   * @interface Props
   * @property {readonly TabItem[]} items - Tabs, in order.
   * @property {string} label - Accessible name of the tab list.
   * @property {string} [value] - Selected value; makes the tabs controlled.
   * @property {string} [defaultValue] - First value when uncontrolled.
   * @property {(value: string) => void} [onValueChange] - Selection callback.
   * @property {Snippet<[string]>} [panel] - Renders the panel for a value.
   */
  interface Props {
    items: readonly TabItem[];
    label: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    panel?: Snippet<[string]>;
    [slot: string]: unknown;
  }

  let {
    items,
    label,
    value,
    defaultValue,
    onValueChange,
    panel,
    ...slots
  }: Props = $props();
  const id = $props.id();
  const env = useArkheEnvironment();
  const service = useMachine(tabs.machine, () =>
    tabsMachineProps({
      id,
      items,
      label,
      value,
      defaultValue,
      onValueChange,
      getRootNode: env().getRootNode,
    }),
  );
  const api = $derived(tabs.connect(service, normalizeProps));
  const slotFor = (key: string) => slots[key] as Snippet | undefined;
</script>

<div {...mergeProps(api.getRootProps(), { class: ARKHE_CLASS })}>
  <div {...api.getListProps()}>
    {#each items as item (item.value)}
      <button
        {...api.getTriggerProps({ value: item.value, disabled: item.disabled })}
        >{item.label}</button>
    {/each}
    <div {...api.getIndicatorProps()}></div>
  </div>
  {#each items as item (item.value)}
    <div {...api.getContentProps({ value: item.value })}>
      {#if panel}{@render panel(item.value)}{:else}{@render slotFor(
          item.value,
        )?.()}{/if}
    </div>
  {/each}
</div>

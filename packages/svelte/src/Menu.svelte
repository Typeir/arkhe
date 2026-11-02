<!--
@component
Renders a menu button and its action list, on Zag's menu machine, portalled
into the environment's container. Arrow keys, Home, End and typeahead move;
focus returns to the button on close.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    entryKey,
    floatingMachineProps,
    isSeparator,
    type MenuEntry,
    type Placement,
  } from '@arkhe/core';
  import * as menu from '@zag-js/menu';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { useArkheEnvironment } from './environment.js';
  import Icon from './Icon.svelte';

  /**
   * Props of Menu.
   *
   * @interface Props
   * @property {string} trigger - Text of the open button.
   * @property {readonly MenuEntry[]} items - Actions and separators.
   * @property {(value: string) => void} onSelect - Called with the chosen action.
   * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
   */
  interface Props {
    trigger: string;
    items: readonly MenuEntry[];
    onSelect: (value: string) => void;
    placement?: Placement;
  }

  let {
    trigger,
    items,
    onSelect,
    placement = 'bottom-start',
  }: Props = $props();
  const id = $props.id();
  const env = useArkheEnvironment();
  const service = useMachine(menu.machine, () => ({
    ...floatingMachineProps({
      id,
      placement,
      getRootNode: env().getRootNode,
    }),
    onSelect: (details: menu.SelectionDetails) => onSelect(details.value),
  }));
  const api = $derived(menu.connect(service, normalizeProps));
</script>

<button {...mergeProps(api.getTriggerProps(), { class: ARKHE_CLASS })}
  >{trigger}<Icon name="chevron-down" /></button>
<div
  class={ARKHE_CLASS}
  use:portal={{ container: env().container(), getRootNode: env().getRootNode }}>
  <div {...api.getPositionerProps()}>
    <ul {...api.getContentProps()}>
      {#each items as entry, index (entryKey(entry, index))}
        {#if isSeparator(entry)}
          <li {...api.getSeparatorProps()}></li>
        {:else}
          <li
            {...api.getItemProps({
              value: entry.value,
              disabled: entry.disabled,
            })}
            data-danger={entry.danger ? '' : undefined}>
            {#if entry.icon}<Icon name={entry.icon} />{/if}{entry.label}
          </li>
        {/if}
      {/each}
    </ul>
  </div>
</div>

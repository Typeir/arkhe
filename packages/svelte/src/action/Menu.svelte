<!--
@component
Renders a menu button and its action list, on Zag's menu machine, portalled
into the environment's container once mounted on the client. Arrow keys,
Home, End and typeahead move; focus returns to the button on close.
-->
<script module lang="ts">
  import type { MenuEntry, Placement } from '@arkhe/core';

  /**
   * Props of Menu.
   *
   * @interface MenuProps
   * @property {string} trigger - Text of the open button; its accessible name when `icon` is set.
   * @property {string} [icon] - Lucide name; makes the open button icon-only.
   * @property {readonly MenuEntry[]} items - Actions and separators.
   * @property {(value: string) => void} onSelect - Called with the chosen action.
   * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
   */
  export interface MenuProps {
    trigger: string;
    icon?: string;
    items: readonly MenuEntry[];
    onSelect: (value: string) => void;
    placement?: Placement;
  }
</script>

<script lang="ts">
  import {
    ARKHE_CLASS,
    entryKey,
    flag,
    floatingMachineProps,
    isSeparator,
  } from '@arkhe/core';
  import * as menu from '@zag-js/menu';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { useArkheEnvironment } from '../base/environment.js';
  import Icon from '../base/Icon.svelte';
  import { useLatch, useMounted } from '../base/mounted.svelte.js';

  let {
    trigger,
    icon,
    items,
    onSelect,
    placement = 'bottom-start',
  }: MenuProps = $props();
  const id = $props.id();
  const env = useArkheEnvironment();
  const service = useMachine(menu.machine, () => ({
    ...floatingMachineProps({
      id,
      placement,
      getRootNode: env().getRootNode,
    }),
    onSelect: (details: menu.SelectionDetails) => {
      onSelect(details.value);
    },
  }));
  const api = $derived(menu.connect(service, normalizeProps));
  const mounted = useMounted();
  const opened = useLatch(() => api.open);
  const controls = $derived(
    opened.current ? api.getTriggerProps()['aria-controls'] : undefined,
  );
</script>

<button
  {...mergeProps(api.getTriggerProps(), {
    class: ARKHE_CLASS,
    'aria-label': icon !== undefined ? trigger : undefined,
    'data-icon-only': flag(icon !== undefined),
    onpointerenter: opened.raise,
    onfocus: opened.raise,
  })}
  aria-controls={controls}
  data-controls={controls}
  >{#if icon !== undefined}<Icon name={icon} />{:else}{trigger}<Icon
      name="chevron-down" />{/if}</button>
{#if mounted.current && opened.current}
  <div
    class={ARKHE_CLASS}
    use:portal={{
      container: env().container(),
      getRootNode: env().getRootNode,
    }}>
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
              data-danger={flag(entry.danger)}>
              {#if entry.icon !== undefined}<Icon
                  name={entry.icon} />{/if}{entry.label}
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  </div>
{/if}

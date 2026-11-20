<!--
@component
Renders a toggle group: a toolbar of pressed / released buttons with one tab
stop, an optional limit with a show more button, and a clear button. Tab
enters it once; arrows, Home and End move between its buttons. A disabled
toggle stays reachable and ignores presses. `value` binds.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    partAttrs,
    rovingFocus,
    toggleRootAttrs,
    togglePress,
    toggleShown,
    uniqueByValue,
    type ToggleItem,
    type ToggleOrientation,
  } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import { useArkhe } from './context.js';
  import Icon from './Icon.svelte';

  /**
   * Props of ToggleGroup.
   *
   * @interface Props
   * @property {string} label - Accessible name of the group.
   * @property {readonly ToggleItem[]} items - Toggles, in order; a repeated value is dropped.
   * @property {readonly string[]} [value] - Pressed values; bindable.
   * @property {readonly string[]} [defaultValue] - First pressed values when unbound.
   * @property {(value: readonly string[]) => void} [onValueChange] - Reports presses.
   * @property {boolean} [multiple] - Several may be pressed at once.
   * @property {boolean} [deselectable] - A single pressed toggle may be released.
   * @property {ToggleOrientation} [orientation] - Direction; horizontal by default.
   * @property {number} [limit] - Toggles shown until the reader asks for more; pressed ones always show.
   * @property {boolean} [clearable] - Adds a clear button while anything is pressed.
   * @property {Snippet<[ToggleItem, boolean]>} [item] - Content of a toggle; it must carry the toggle's name.
   */
  interface Props {
    label: string;
    items: readonly ToggleItem[];
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: readonly string[]) => void;
    multiple?: boolean;
    deselectable?: boolean;
    orientation?: ToggleOrientation;
    limit?: number;
    clearable?: boolean;
    item?: Snippet<[ToggleItem, boolean]>;
  }

  let {
    label,
    items,
    defaultValue,
    value = $bindable(defaultValue ?? []),
    onValueChange,
    multiple,
    deselectable,
    orientation,
    limit,
    clearable,
    item: content,
  }: Props = $props();
  const arkhe = useArkhe();
  let expanded = $state(false);
  let root = $state<HTMLDivElement>();
  const all = $derived(uniqueByValue(items));
  const shown = $derived(toggleShown(all, value, limit, expanded));
  const commit = (next: readonly string[]) => {
    if (next === value) return;
    value = next;
    onValueChange?.(next);
  };
  const clear = () => {
    commit([]);
    root?.querySelector<HTMLElement>('[data-part="item"]')?.focus();
  };
</script>

<div
  bind:this={root}
  {@attach (node) => rovingFocus(node)}
  class={ARKHE_CLASS}
  {...partAttrs('toggle-group', 'root')}
  {...toggleRootAttrs(label, orientation)}>
  {#each shown as entry (entry.value)}
    {@const on = value.includes(entry.value)}
    <button
      type="button"
      {...partAttrs('toggle-group', 'item')}
      data-value={entry.value}
      aria-pressed={on}
      aria-disabled={entry.disabled ? true : undefined}
      onclick={() =>
        commit(togglePress(value, entry, { multiple, deselectable }))}>
      {#if entry.icon}<Icon name={entry.icon} />{/if}
      {#if content}{@render content(entry, on)}{:else}<span
          {...partAttrs('toggle-group', 'label')}>{entry.label}</span
        >{/if}
    </button>
  {/each}
  {#if limit !== undefined && all.length > limit}
    <button
      type="button"
      {...partAttrs('toggle-group', 'more')}
      aria-expanded={expanded}
      onclick={() => (expanded = !expanded)}>
      {expanded ? arkhe().labels.showLess : arkhe().labels.showMore}
    </button>
  {/if}
  {#if clearable && value.length > 0}
    <button
      type="button"
      {...partAttrs('toggle-group', 'clear')}
      onclick={clear}>
      {arkhe().labels.clearSelection}
    </button>
  {/if}
</div>

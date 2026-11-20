<!--
@component
Renders an accordion: Collapsible sections under one state, each with a
heading, optionally one open at a time, one always open, or an expand all
button. Panels come from the `panel` snippet, as Tabs. No arrow keys between
triggers: arrows scroll long panels. `value` binds.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    accordionAllOpen,
    accordionHeld,
    accordionToggle,
    accordionToggleAll,
    partAttrs,
    uniqueByValue,
    type AccordionItem,
    type HeadingLevel,
  } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import Collapsible from './Collapsible.svelte';
  import { useArkhe } from '../base/context.js';

  /**
   * Props of Accordion.
   *
   * @interface Props
   * @property {readonly AccordionItem[]} items - Sections, in order; a repeated value is dropped.
   * @property {Snippet<[string]>} panel - Panel for a value.
   * @property {readonly string[]} [value] - Open values; bindable.
   * @property {readonly string[]} [defaultValue] - First open values when unbound.
   * @property {(value: readonly string[]) => void} [onValueChange] - Reports changes.
   * @property {boolean} [multiple] - Several open at once; true by default.
   * @property {boolean} [collapsible] - The last open section may close; true by default.
   * @property {HeadingLevel} [heading] - Heading level of every trigger; 3 by default.
   * @property {boolean} [expandAll] - Adds an expand / collapse all button while `multiple`.
   */
  interface Props {
    items: readonly AccordionItem[];
    panel: Snippet<[string]>;
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: readonly string[]) => void;
    multiple?: boolean;
    collapsible?: boolean;
    heading?: HeadingLevel;
    expandAll?: boolean;
  }

  let {
    items,
    panel,
    defaultValue,
    value = $bindable(defaultValue ?? []),
    onValueChange,
    multiple = true,
    collapsible = true,
    heading = 3,
    expandAll,
  }: Props = $props();
  const arkhe = useArkhe();
  const all = $derived(uniqueByValue(items));
  const rules = $derived({ multiple, collapsible });
  const full = $derived(accordionAllOpen(all, value));
  const commit = (next: readonly string[]) => {
    if (next === value) return;
    value = next;
    onValueChange?.(next);
  };
</script>

<div class={ARKHE_CLASS} {...partAttrs('accordion', 'root')}>
  {#if expandAll && multiple}
    <button
      type="button"
      {...partAttrs('accordion', 'toggle-all')}
      aria-expanded={full}
      onclick={() => commit(accordionToggleAll(all, value, rules))}>
      {full ? arkhe().labels.collapseAll : arkhe().labels.expandAll}
    </button>
  {/if}
  {#each all as item (item.value)}
    <Collapsible
      title={item.title}
      {heading}
      open={value.includes(item.value)}
      disabled={item.disabled || accordionHeld(value, item.value, rules)}
      onOpenChange={(next) =>
        commit(accordionToggle(value, item, next, rules))}>
      {@render panel(item.value)}
    </Collapsible>
  {/each}
</div>

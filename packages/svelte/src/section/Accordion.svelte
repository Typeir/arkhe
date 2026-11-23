<!--
@component
Renders an accordion: Collapsible sections under one state, each with a
heading, optionally one open at a time, one always open, or an expand all
button. Panels come from the `panel` snippet, as Tabs. No arrow keys between
triggers: arrows scroll long panels. `value` binds.
-->
<script module lang="ts">
  import type { AccordionItem, HeadingLevel } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of Accordion.
   *
   * @interface AccordionProps
   * @property {readonly AccordionItem[]} items - Sections, in order; a repeated value is dropped.
   * @property {Snippet<[string]>} panel - Panel for a value.
   * @property {readonly string[]} [value] - Open values; bindable.
   * @property {readonly string[]} [defaultValue] - First open values when uncontrolled.
   * @property {(value: readonly string[]) => void} [onValueChange] - Reports changes.
   * @property {boolean} [multiple] - Several open at once. Defaults to `true`.
   * @property {boolean} [collapsible] - The last open section may close. Defaults to `true`.
   * @property {HeadingLevel} [heading] - Heading level of every trigger. Defaults to `3`.
   * @property {boolean} [expandAll] - Adds an expand / collapse all button while `multiple`.
   */
  export interface AccordionProps {
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
</script>

<script lang="ts">
  import {
    type AccordionAction,
    accordionAllOpen,
    accordionHeld,
    accordionReduce,
    ARKHE_CLASS,
    dispatch,
    partAttrs,
    uniqueByValue,
  } from '@arkhe/core';
  import { untrack } from 'svelte';
  import { useArkhe } from '../base/context.js';
  import Collapsible from './Collapsible.svelte';

  let {
    items,
    panel,
    value = $bindable(),
    defaultValue,
    onValueChange,
    multiple = true,
    collapsible = true,
    heading = 3,
    expandAll,
  }: AccordionProps = $props();
  const arkhe = useArkhe();
  const initial = untrack(() => defaultValue ?? []);
  const expanded = $derived(value ?? initial);
  const all = $derived(uniqueByValue(items));
  const rules = $derived({ items: all, multiple, collapsible });
  const full = $derived(accordionAllOpen(all, expanded));
  const commit = (next: readonly string[]) => {
    value = next;
    onValueChange?.(next);
  };
  const act = (action: AccordionAction) => {
    dispatch(accordionReduce, expanded, action, rules, commit);
  };
</script>

<div class={ARKHE_CLASS} {...partAttrs('accordion', 'root')}>
  {#if expandAll && multiple}
    <button
      type="button"
      {...partAttrs('accordion', 'toggle-all')}
      aria-expanded={full}
      onclick={() => {
        act({ type: 'toggle-all' });
      }}>
      {full ? arkhe().labels.collapseAll : arkhe().labels.expandAll}
    </button>
  {/if}
  {#each all as item (item.value)}
    <Collapsible
      title={item.title}
      {heading}
      open={expanded.includes(item.value)}
      disabled={item.disabled || accordionHeld(expanded, item.value, rules)}
      onOpenChange={(next) => {
        act({ type: 'set', item, open: next });
      }}>
      {@render panel(item.value)}
    </Collapsible>
  {/each}
</div>

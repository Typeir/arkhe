<!--
@component
Renders the option list of ComboboxField, or the line that stands in for it
while results load, fail or are empty. Not exported. It renders in the
floating dropdown, or inline in a sheet.
-->
<script lang="ts" generics="T extends SelectOption">
  import {
    flag,
    isGrouped,
    partAttrs,
    slug,
    type SelectOption,
  } from '@arkhe/core';
  import type * as combobox from '@zag-js/combobox';
  import { mergeProps, type PropTypes } from '@zag-js/svelte';
  import type { Snippet } from 'svelte';
  import Status from '../feedback/Status.svelte';
  import type { VirtualRows } from '../list/virtualRows.svelte.js';

  /**
   * Props of ComboboxList.
   *
   * @interface Props
   * @property {combobox.Api<PropTypes, T>} api - Zag combobox API.
   * @property {ReturnType<typeof combobox.collection<T>>} collection - Shown options as Zag's collection.
   * @property {readonly T[]} shown - Shown options.
   * @property {'loading' | 'failed' | 'empty'} [note] - Line shown instead of the options.
   * @property {string} emptyText - Text of the empty line.
   * @property {Snippet<[T, number]>} option - Renders one option at its place in `shown`.
   * @property {boolean} [inline] - Renders in place and always open.
   * @property {VirtualRows} rows - Virtual rows of a flat list.
   */
  interface Props {
    api: combobox.Api<PropTypes, T>;
    collection: ReturnType<typeof combobox.collection<T>>;
    shown: readonly T[];
    note?: 'loading' | 'failed' | 'empty';
    emptyText: string;
    option: Snippet<[T, number]>;
    inline?: boolean;
    rows: VirtualRows;
  }

  let { api, collection, shown, note, emptyText, option, inline, rows }: Props =
    $props();
  const open = $derived(Boolean(inline) || api.open);
</script>

{#if note}
  <div
    {...partAttrs('combobox', 'note')}
    data-inline={flag(inline)}
    hidden={!open}>
    {#if note === 'loading'}
      <Status kind="loading" />
    {:else if note === 'failed'}
      <Status kind="error" />
    {:else}
      <div {...partAttrs('combobox', 'empty')}>{emptyText}</div>
    {/if}
  </div>
{/if}
<div
  {...mergeProps(api.getContentProps(), { hidden: !!note || !open })}
  {@attach rows.attach}
  style:--row-pitch={rows.vars?.['--row-pitch']}
  style:--virtual-before={rows.vars?.['--virtual-before']}
  style:--virtual-after={rows.vars?.['--virtual-after']}
  data-virtual={flag(rows.on)}
  data-inline={flag(inline)}>
  {#if note}{:else if rows.on}
    {#each shown.slice(rows.range.start, rows.range.end) as entry, at (entry.value)}
      {@render option(entry, rows.range.start + at)}
    {/each}
  {:else if isGrouped(shown)}
    {#each collection.group() as [group, members] (group)}
      <div {...api.getItemGroupProps({ id: slug(group) })}>
        <div {...api.getItemGroupLabelProps({ htmlFor: slug(group) })}>
          {group}
        </div>
        {#each members as entry, at (entry.value)}
          {@render option(entry, at)}
        {/each}
      </div>
    {/each}
  {:else}
    {#each shown as entry, at (entry.value)}
      {@render option(entry, at)}
    {/each}
  {/if}
</div>

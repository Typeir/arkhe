<!--
@component
Renders a scroll box over a long list of fixed-pitch rows that draws only the
rows in view plus an overscan margin. Each row says its place in the whole
set.
-->
<script lang="ts" generics="T">
  import { ARKHE_CLASS, partAttrs, type VirtualRange } from '@arkhe/core';
  import { untrack, type Snippet } from 'svelte';
  import { useVirtualRows } from './virtualRows.svelte.js';

  /**
   * Props of VirtualList.
   *
   * @interface Props
   * @property {readonly T[]} items - Rows.
   * @property {number} rowPitch - Row height in rem.
   * @property {Snippet<[T, number]>} item - Row body.
   * @property {string} [label] - Accessible name of the list.
   * @property {string} [maxHeight] - CSS height past which the list scrolls. Defaults to `37.5rem`.
   * @property {number} [overscan] - Rows drawn past each edge of the view. Defaults to `VIRTUAL_OVERSCAN`.
   * @property {(item: T, index: number) => string | number} [getKey] - Stable row key. Defaults to the index.
   * @property {(visible: VirtualRange) => void} [onRange] - Rows in view changed, as to load more near the end.
   */
  interface Props {
    items: readonly T[];
    rowPitch: number;
    item: Snippet<[T, number]>;
    label?: string;
    maxHeight?: string;
    overscan?: number;
    getKey?: (item: T, index: number) => string | number;
    onRange?: (visible: VirtualRange) => void;
  }

  let props: Props = $props();
  const rows = useVirtualRows(
    () => props.items.length,
    () => props.rowPitch,
    untrack(() => props.overscan),
  );
  const start = $derived(rows.visible.start);
  const end = $derived(rows.visible.end);
  $effect(() => {
    props.onRange?.({ start, end });
  });
</script>

<div
  class={ARKHE_CLASS}
  {...partAttrs('virtual-list', 'root')}
  role="list"
  aria-label={props.label}
  {@attach rows.attach}
  style:--row-pitch={rows.vars?.['--row-pitch']}
  style:--virtual-before={rows.vars?.['--virtual-before']}
  style:--virtual-after={rows.vars?.['--virtual-after']}
  style:--virtual-max={props.maxHeight}
  data-virtual="">
  {#each props.items.slice(rows.range.start, rows.range.end) as entry, at (props.getKey?.(entry, rows.range.start + at) ?? rows.range.start + at)}
    <div
      {...partAttrs('virtual-list', 'item')}
      role="listitem"
      {...rows.position(rows.range.start + at)}>
      {@render props.item(entry, rows.range.start + at)}
    </div>
  {/each}
</div>

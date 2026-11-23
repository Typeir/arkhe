<!--
@component
Renders a scroll box over a long list of fixed-pitch rows that draws only the
rows in view plus an overscan margin. Each row says its place in the whole
set.
-->
<script module lang="ts">
  import type { VirtualRange } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of VirtualList.
   *
   * @interface VirtualListProps
   * @template T
   * @property {readonly T[]} items - Rows.
   * @property {number} rowPitch - Row height in rem.
   * @property {Snippet<[T, number]>} item - Row body.
   * @property {string} [label] - Accessible name of the list.
   * @property {string} [maxHeight] - CSS height past which the list scrolls. Defaults to `37.5rem`.
   * @property {number} [overscan] - Rows drawn past each edge of the view. Defaults to `VIRTUAL_OVERSCAN`.
   * @property {(item: T, index: number) => string | number} [getKey] - Stable row key. Defaults to the index.
   * @property {(visible: VirtualRange) => void} [onRange] - Rows in view changed, as to load more near the end.
   */
  export interface VirtualListProps<T> {
    items: readonly T[];
    rowPitch: number;
    item: Snippet<[T, number]>;
    label?: string;
    maxHeight?: string;
    overscan?: number;
    getKey?: (item: T, index: number) => string | number;
    onRange?: (visible: VirtualRange) => void;
  }
</script>

<script lang="ts" generics="T">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';
  import { untrack } from 'svelte';
  import { useVirtualRows } from './virtualRows.svelte.js';

  let {
    items,
    rowPitch,
    item,
    label,
    maxHeight,
    overscan,
    getKey,
    onRange,
  }: VirtualListProps<T> = $props();
  const rows = useVirtualRows(
    () => items.length,
    () => rowPitch,
    untrack(() => overscan),
  );
  const start = $derived(rows.visible.start);
  const end = $derived(rows.visible.end);
  $effect(() => {
    onRange?.({ start, end });
  });
</script>

<ul
  class={ARKHE_CLASS}
  {...partAttrs('virtual-list', 'root')}
  aria-label={label}
  {@attach rows.attach}
  style:--row-pitch={rows.vars?.['--row-pitch']}
  style:--virtual-before={rows.vars?.['--virtual-before']}
  style:--virtual-after={rows.vars?.['--virtual-after']}
  style:--virtual-max={maxHeight}
  data-virtual="">
  {#each items.slice(rows.range.start, rows.range.end) as entry, at (getKey?.(entry, rows.range.start + at) ?? rows.range.start + at)}
    <li
      {...partAttrs('virtual-list', 'item')}
      {...rows.position(rows.range.start + at)}>
      {@render item(entry, rows.range.start + at)}
    </li>
  {/each}
</ul>

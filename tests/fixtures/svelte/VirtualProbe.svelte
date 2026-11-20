<!--
@component
Test fixture: a box wired to `useVirtualRows` over 100 rows, showing the
range drawn, one row's set position and a button that scrolls to row 50.
-->
<script lang="ts">
  import { useVirtualRows } from '../../../packages/svelte/src/list/virtualRows.svelte';

  /**
   * Props of VirtualProbe.
   *
   * @interface Props
   * @property {number} [pitch] - Row height in rem.
   */
  interface Props {
    pitch?: number;
  }

  let { pitch }: Props = $props();
  const rows = useVirtualRows(
    () => 100,
    () => pitch,
  );
</script>

<div
  data-testid="box"
  {@attach rows.attach}
  style:--row-pitch={rows.vars?.['--row-pitch']}
  style:--virtual-before={rows.vars?.['--virtual-before']}
  style:--virtual-after={rows.vars?.['--virtual-after']}>
  <output>{`${rows.range.start}-${rows.range.end}`}</output>
  <span data-testid="row" {...rows.position(4)}></span>
  <button type="button" onclick={() => rows.scrollTo({ index: 50 })}>Go</button>
</div>

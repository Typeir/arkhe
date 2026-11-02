<!--
@component
Renders one placeholder bar, hidden from assistive technology.
-->
<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';

  /**
   * Props of Skeleton.
   *
   * @interface Props
   * @property {'line' | 'block'} [shape] - A text line or a block. Defaults to `line`.
   * @property {string} [width] - CSS width. Defaults to the full row.
   * @property {string} [height] - CSS height. Defaults by shape.
   */
  interface Props {
    shape?: 'line' | 'block';
    width?: string;
    height?: string;
  }

  let { shape = 'line', width, height }: Props = $props();
</script>

<span
  class={ARKHE_CLASS}
  {...partAttrs('skeleton', 'root')}
  data-shape={shape}
  style:--skeleton-width={width}
  style:--skeleton-height={height}
  aria-hidden="true"></span>

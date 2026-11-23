<!--
@component
Renders one placeholder bar, hidden from assistive technology.
-->
<script module lang="ts">
  /**
   * Props of Skeleton.
   *
   * @interface SkeletonProps
   * @property {'line' | 'block'} [shape] - A text line or a block. Defaults to `line`.
   * @property {string} [width] - CSS width. Defaults to the full row.
   * @property {string} [height] - CSS height. Defaults by shape.
   */
  export interface SkeletonProps {
    shape?: 'line' | 'block';
    width?: string;
    height?: string;
  }
</script>

<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';

  let { shape = 'line', width, height }: SkeletonProps = $props();
</script>

<span
  class={ARKHE_CLASS}
  {...partAttrs('skeleton', 'root')}
  data-shape={shape}
  style:--skeleton-width={width}
  style:--skeleton-height={height}
  aria-hidden="true"></span>

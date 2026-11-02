<!--
@component
Renders a progress bar. Past `max` it reads as full, marks `data-over`, and its
value text says by how much. Throws a RangeError when `max` is not positive.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    flag,
    partAttrs,
    progressState,
    progressValueText,
  } from '@arkhe/core';
  import { useArkhe } from './context.js';

  /**
   * Props of Progress.
   *
   * @interface Props
   * @property {number} value - Current amount; may exceed `max`.
   * @property {number} max - Amount that fills the rail.
   * @property {string} label - Accessible name.
   * @property {readonly number[]} [markers] - Thresholds, in the value's units.
   * @property {boolean} [showValue] - Prints the value text above the rail.
   */
  interface Props {
    value: number;
    max: number;
    label: string;
    markers?: readonly number[];
    showValue?: boolean;
  }

  let { value, max, label, markers, showValue }: Props = $props();
  const arkhe = useArkhe();
  const state = $derived(progressState(value, max, markers));
  const text = $derived(progressValueText(value, max, arkhe().labels));
</script>

<div
  class={ARKHE_CLASS}
  {...partAttrs('progress', 'root')}
  data-over={flag(state.over)}
  role="progressbar"
  aria-label={label}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-valuenow={Math.min(value, max)}
  aria-valuetext={text}>
  {#if showValue}<span {...partAttrs('progress', 'value')}>{text}</span>{/if}
  <span {...partAttrs('progress', 'track')}>
    <span {...partAttrs('progress', 'fill')} style:--progress={state.ratio}
    ></span>
    {#each state.markers as marker (marker.at)}
      <span
        {...partAttrs('progress', 'marker')}
        data-reached={flag(marker.reached)}
        style:--at={marker.at}></span>
    {/each}
  </span>
</div>

<!--
@component
Renders a native progress element on a rail with threshold markers. Past
`max` it reads as full, marks `data-over`, and its value text says by how
much; without a value it is indeterminate. The value text shown above it is
for sight only; the element itself carries it. Throws a RangeError when `max` is not positive.
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
   * @property {number} [value] - Current amount; may exceed `max`. None while the amount is unknown.
   * @property {number} max - Amount that fills the rail.
   * @property {string} label - Accessible name.
   * @property {readonly number[]} [markers] - Thresholds, in the value's units; repeats are dropped.
   * @property {boolean} [showValue] - Prints the value text above the rail.
   */
  interface Props {
    value?: number;
    max: number;
    label: string;
    markers?: readonly number[];
    showValue?: boolean;
  }

  let { value, max, label, markers, showValue }: Props = $props();
  const arkhe = useArkhe();
  const state = $derived(progressState(value, max, markers));
  const text = $derived(
    state.indeterminate
      ? undefined
      : progressValueText(state, max, arkhe().labels, arkhe().locale),
  );
</script>

<div
  class={ARKHE_CLASS}
  {...partAttrs('progress', 'root')}
  data-over={flag(state.over)}>
  {#if showValue && text !== undefined}<span
      {...partAttrs('progress', 'value')}
      aria-hidden="true">{text}</span
    >{/if}
  <span {...partAttrs('progress', 'track')}>
    <progress
      {...partAttrs('progress', 'fill')}
      {max}
      value={state.indeterminate ? undefined : Math.min(state.value, max)}
      aria-label={label}
      aria-valuetext={text}></progress>
    {#each state.markers as marker (marker.at)}
      <span
        {...partAttrs('progress', 'marker')}
        data-reached={flag(marker.reached)}
        style:--at={marker.at}></span>
    {/each}
  </span>
</div>

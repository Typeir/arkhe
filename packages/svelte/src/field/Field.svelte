<!--
@component
Renders a labelled control. The control receives its id, description ids and
invalid state through the `children` snippet. A new error is announced
politely.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    fieldControlAttrs,
    fieldIds,
    flag,
    partAttrs,
    type FieldControlAttrs,
  } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import FieldNote from './FieldNote.svelte';

  /**
   * Props of Field.
   *
   * @interface Props
   * @property {string} label - Visible label.
   * @property {string | number} [readout] - Current value shown beside the label; not announced as it changes.
   * @property {string} [hint] - Help text under the control.
   * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
   * @property {Snippet<[FieldControlAttrs]>} children - Renders the control with the given attributes.
   */
  interface Props {
    label: string;
    readout?: string | number;
    hint?: string;
    error?: string;
    children: Snippet<[FieldControlAttrs]>;
  }

  let { label, readout, hint, error, children }: Props = $props();
  const id = $props.id();
  const ids = fieldIds(id);
  const showHint = $derived(Boolean(hint) && !error);
  const control = $derived(fieldControlAttrs(ids, showHint, Boolean(error)));
</script>

<div
  class={ARKHE_CLASS}
  {...partAttrs('field', 'root')}
  data-invalid={flag(Boolean(error))}>
  <div {...partAttrs('field', 'head')}>
    <label {...partAttrs('field', 'label')} id={ids.label} for={ids.control}
      >{label}</label>
    {#if readout !== undefined}
      <output
        {...partAttrs('field', 'readout')}
        for={ids.control}
        aria-live="off">{readout}</output>
    {/if}
  </div>
  {@render children(control)}
  <FieldNote {ids} {hint} {error} />
</div>

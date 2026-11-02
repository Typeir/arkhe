<!--
@component
Renders a labelled control. The control receives its id, description ids and
invalid state through the `children` snippet.
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

  /**
   * Props of Field.
   *
   * @interface Props
   * @property {string} label - Visible label.
   * @property {string | number} [readout] - Current value shown beside the label.
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
      <output {...partAttrs('field', 'readout')} for={ids.control}
        >{readout}</output>
    {/if}
  </div>
  {@render children(control)}
  {#if showHint}<p {...partAttrs('field', 'hint')} id={ids.hint}>{hint}</p>{/if}
  {#if error}<p {...partAttrs('field', 'error')} id={ids.error}>{error}</p>{/if}
</div>

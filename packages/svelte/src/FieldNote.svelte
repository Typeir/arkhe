<!--
@component
Renders the line under a control: the hint or, once there is one, the error.
A new error is announced politely. Not exported: Field, the select family and
NumericInput share it.
-->
<script lang="ts">
  import { partAttrs, type FieldIds } from '@arkhe/core';
  import { untrack } from 'svelte';
  import { useArkhe } from './context.js';

  /**
   * Props of FieldNote.
   *
   * @interface Props
   * @property {FieldIds} ids - Field ids; the line takes the hint or error id.
   * @property {string} [hint] - Help text.
   * @property {string} [error] - Error text; replaces the hint.
   */
  interface Props {
    ids: FieldIds;
    hint?: string;
    error?: string;
  }

  let { ids, hint, error }: Props = $props();
  const arkhe = useArkhe();
  $effect(() => {
    if (error) untrack(() => arkhe().announcer).announce(error);
  });
</script>

{#if error}
  <p {...partAttrs('field', 'error')} id={ids.error}>{error}</p>
{:else if hint}
  <p {...partAttrs('field', 'hint')} id={ids.hint}>{hint}</p>
{/if}

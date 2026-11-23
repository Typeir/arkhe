<!--
@component
Renders the line under a control: the hint or, once there is one, the error.
A new error is announced politely. Not exported: Field, the select family and
NumericInput share it.
-->
<script module lang="ts">
  import type { FieldIds } from '@arkhe/core';

  /**
   * Props of FieldNote.
   *
   * @interface FieldNoteProps
   * @property {FieldIds} ids - Field ids; the line takes the hint or error id.
   * @property {string} [hint] - Help text.
   * @property {string} [error] - Error text; replaces the hint.
   */
  export interface FieldNoteProps {
    ids: FieldIds;
    hint?: string;
    error?: string;
  }
</script>

<script lang="ts">
  import { hasText, partAttrs } from '@arkhe/core';
  import { untrack } from 'svelte';
  import { useArkhe } from '../base/context.js';

  let { ids, hint, error }: FieldNoteProps = $props();
  const arkhe = useArkhe();
  $effect(() => {
    if (hasText(error)) untrack(() => arkhe().announcer).announce(error);
  });
</script>

{#if error}
  <p {...partAttrs('field', 'error')} id={ids.error}>{error}</p>
{:else if hint}
  <p {...partAttrs('field', 'hint')} id={ids.hint}>{hint}</p>
{/if}

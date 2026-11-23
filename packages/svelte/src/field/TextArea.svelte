<!--
@component
Renders a multi-line text area. Native attributes pass through; `value` binds.
-->
<script module lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  /**
   * Props of TextArea: native textarea attributes, minus `class`.
   *
   * @typedef {Omit<HTMLTextareaAttributes, 'class'>} TextAreaProps
   */
  export type TextAreaProps = Omit<HTMLTextareaAttributes, 'class'>;
</script>

<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';

  let { value = $bindable(), ...rest }: TextAreaProps = $props();
</script>

<textarea
  {...rest}
  bind:value
  class={ARKHE_CLASS}
  {...partAttrs('text-area', 'root')}></textarea>

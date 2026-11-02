<!--
@component
Renders a multi-line text area. Native attributes pass through; `value` binds.
-->
<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  /**
   * Props of TextArea: native textarea attributes, minus `class`.
   *
   * @typedef {Omit<HTMLTextareaAttributes, 'class'>} Props
   */
  type Props = Omit<HTMLTextareaAttributes, 'class'>;

  let { value = $bindable(), ...rest }: Props = $props();
</script>

<textarea
  {...rest}
  bind:value
  class={ARKHE_CLASS}
  {...partAttrs('text-area', 'root')}></textarea>

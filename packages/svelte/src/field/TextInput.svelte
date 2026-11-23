<!--
@component
Renders a single-line text input. Native attributes pass through; `value`
binds. Type defaults to `text`.
-->
<script module lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  /**
   * Props of TextInput: native input attributes, minus `class`.
   *
   * @typedef {Omit<HTMLInputAttributes, 'class'>} TextInputProps
   */
  export type TextInputProps = Omit<HTMLInputAttributes, 'class'>;
</script>

<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';

  let {
    value = $bindable(),
    type = 'text',
    ...rest
  }: TextInputProps = $props();
</script>

<input
  {...rest}
  bind:value
  {type}
  class={ARKHE_CLASS}
  {...partAttrs('text-input', 'root')} />

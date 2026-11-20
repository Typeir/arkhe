<!--
@component
Renders a single-line text input. Native attributes pass through; `value`
binds. Type defaults to `text`.
-->
<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';
  import type { HTMLInputAttributes } from 'svelte/elements';

  /**
   * Props of TextInput: native input attributes, minus `class`.
   *
   * @typedef {Omit<HTMLInputAttributes, 'class'>} Props
   */
  type Props = Omit<HTMLInputAttributes, 'class'>;

  let { value = $bindable(), type = 'text', ...rest }: Props = $props();
</script>

<input
  {...rest}
  bind:value
  {type}
  class={ARKHE_CLASS}
  {...partAttrs('text-input', 'root')} />

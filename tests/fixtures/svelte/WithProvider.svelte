<!--
@component
Test fixture: renders `component` with `innerProps` inside an ArkheProvider built
from `provider`.
-->
<script lang="ts" generics="P extends Record<string, unknown>">
  import { ArkheProvider } from '@arkhe/svelte';
  import type { Component, ComponentProps } from 'svelte';

  /**
   * Props of WithProvider.
   *
   * @interface Props
   * @property {Omit<ComponentProps<typeof ArkheProvider>, 'children'>} provider - Provider props.
   * @property {Component<P>} component - Component under test.
   * @property {P} innerProps - Its props.
   */
  interface Props {
    provider: Omit<ComponentProps<typeof ArkheProvider>, 'children'>;
    component: Component<P>;
    innerProps: P;
  }

  let { provider, component: Inner, innerProps }: Props = $props();
</script>

<ArkheProvider {...provider}>
  <Inner {...innerProps} />
</ArkheProvider>

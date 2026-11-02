<!--
@component
Renders a status line: empty, loading, error or info. Errors interrupt; the
rest wait their turn.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    partAttrs,
    statusLook,
    type StatusKind,
  } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import { useArkhe } from './context.js';
  import Icon from './Icon.svelte';

  /**
   * Props of Status.
   *
   * @interface Props
   * @property {StatusKind} kind - Kind of status.
   * @property {Snippet} [children] - Text; defaults to the kind's label.
   */
  interface Props {
    kind: StatusKind;
    children?: Snippet;
  }

  let { kind, children }: Props = $props();
  const arkhe = useArkhe();
  const look = $derived(statusLook(kind, arkhe().labels));
</script>

<div
  class={ARKHE_CLASS}
  {...partAttrs('status', 'root')}
  data-kind={kind}
  role={look.role}>
  <Icon name={look.icon} />
  <span {...partAttrs('status', 'text')}>
    {#if children}{@render children()}{:else}{look.text}{/if}
  </span>
</div>

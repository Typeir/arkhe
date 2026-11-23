<!--
@component
Renders a status line: empty, loading, error or info. The app announcer
speaks its text on mount and on each change; errors interrupt, the rest wait.
The root is a `span`, so a status fits phrasing content such as a hover card
inside a paragraph.
-->
<script module lang="ts">
  import type { StatusKind } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of Status.
   *
   * @interface StatusProps
   * @property {StatusKind} kind - Kind of status.
   * @property {Snippet} [children] - Text. Defaults to the kind's label.
   */
  export interface StatusProps {
    kind: StatusKind;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import {
    announceText,
    ARKHE_CLASS,
    partAttrs,
    statusLook,
  } from '@arkhe/core';
  import { useArkhe } from '../base/context.js';
  import Icon from '../base/Icon.svelte';

  let { kind, children }: StatusProps = $props();
  const arkhe = useArkhe();
  const look = $derived(statusLook(kind, arkhe().labels));
  let region = $state<HTMLSpanElement | null>(null);
  $effect(() =>
    region
      ? announceText(region, arkhe().announcer, () => look.politeness)
      : undefined,
  );
</script>

<span
  bind:this={region}
  class={ARKHE_CLASS}
  {...partAttrs('status', 'root')}
  data-kind={kind}>
  <Icon name={look.icon} />
  <span {...partAttrs('status', 'text')}>
    {#if children}{@render children()}{:else}{look.text}{/if}
  </span>
</span>

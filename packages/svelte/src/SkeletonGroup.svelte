<!--
@component
Owns a skeleton and its content. While loading, its only text is the hidden
`loading` label, which the announcer speaks. The engine attaches on mount and
whenever loading starts, is told the content is ready in an effect, which
runs after the DOM update and before paint, so the cover paints first, and
detaches on unmount. Without a loaded engine the content just shows.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    announceText,
    flag,
    partAttrs,
    type Fx,
  } from '@arkhe/core';
  import { untrack, type Snippet } from 'svelte';
  import { useArkhe } from './context.js';

  /**
   * Props of SkeletonGroup.
   *
   * @interface Props
   * @property {boolean} loading - True: show `skeleton` and animate. False: show `children` and reveal them.
   * @property {Snippet} skeleton - Shapes in the final layout's shape.
   * @property {Snippet} [children] - The real content, mounted only once loading ends.
   * @property {boolean} [effect] - False keeps the CSS skeleton for this group. Defaults to true.
   * @property {() => void} [onRevealed] - Called when the reveal has finished, or at once without an effect.
   */
  interface Props {
    loading: boolean;
    skeleton: Snippet;
    children?: Snippet;
    effect?: boolean;
    onRevealed?: () => void;
  }

  let {
    loading,
    skeleton,
    children,
    effect: animated = true,
    onRevealed,
  }: Props = $props();
  const arkhe = useArkhe();
  let host = $state<HTMLDivElement>();
  let label = $state<HTMLSpanElement>();
  let shown = untrack(() => loading);
  $effect(() =>
    loading && label
      ? announceText(label, arkhe().announcer, () => 'polite')
      : undefined,
  );
  let attached: Fx | null = null;
  $effect(() => {
    const el = host;
    if (!loading || !animated || !el) return;
    const attach = (fx: Fx | null) => {
      attached = fx;
      fx?.attach(el);
    };
    const effects = untrack(() => arkhe().effects);
    if (effects.engine) return attach(effects.engine);
    let live = true;
    void effects.request().then((fx) => {
      if (live) attach(fx);
    });
    return () => {
      live = false;
    };
  });
  $effect(() => {
    const now = loading;
    const el = host;
    untrack(() => {
      const was = shown;
      shown = now;
      if (!was || now || !el) return;
      const done = () => onRevealed?.();
      const fx = animated ? attached : null;
      if (fx) fx.ready(el, done);
      else done();
    });
  });
  $effect(() => {
    const el = host;
    return () => {
      if (el) attached?.detach(el);
    };
  });
</script>

<div
  bind:this={host}
  class={ARKHE_CLASS}
  {...partAttrs('skeleton', 'group')}
  data-loading={flag(loading)}>
  {#if loading}
    <span bind:this={label} {...partAttrs('skeleton', 'label')}
      >{arkhe().labels.loading}</span>
    {@render skeleton()}
  {:else}
    {@render children?.()}
  {/if}
</div>

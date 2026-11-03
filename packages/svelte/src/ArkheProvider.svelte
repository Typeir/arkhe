<!--
@component
Supplies labels, icons, the link renderer, the announcer and the effect
engine to every Arkhé component below. Mounts the announcer's live regions
with itself, and destroys its engine with itself.
-->
<script lang="ts">
  import {
    Announcer,
    FxLoader,
    resolveLabels,
    type ArkheLabels,
    type EffectsSetting,
    type IconSet,
  } from '@arkhe/core';
  import { untrack, type Snippet } from 'svelte';
  import {
    loadFx,
    provideArkhe,
    type IconComponent,
    type LinkComponent,
  } from './context.js';

  /**
   * Props of ArkheProvider.
   *
   * @interface Props
   * @property {Partial<ArkheLabels>} [labels] - Translated label templates.
   * @property {IconSet<IconComponent>} [icons] - Icons by Lucide name; win over Lucide.
   * @property {LinkComponent} [link] - Link renderer. Defaults to `a`.
   * @property {EffectsSetting} [effects] - Canvas effect options, or `false` for CSS skeletons everywhere. Read once.
   * @property {Snippet} children - App subtree.
   */
  interface Props {
    labels?: Partial<ArkheLabels>;
    icons?: IconSet<IconComponent>;
    link?: LinkComponent;
    effects?: EffectsSetting;
    children: Snippet;
  }

  let { labels, icons, link, effects, children }: Props = $props();
  const announcer = new Announcer();
  const engine = new FxLoader(untrack(() => effects) ?? {}, loadFx);
  $effect.pre(() => announcer.mount());
  $effect.pre(() => engine.mount());
  const value = $derived({
    labels: resolveLabels(labels),
    icons: icons ? [icons] : [],
    link,
    announcer,
    effects: engine,
  });
  provideArkhe(() => value);
</script>

{@render children()}

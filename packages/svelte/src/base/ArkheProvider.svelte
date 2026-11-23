<!--
@component
Supplies labels, icons, the link renderer, the announcer and the effect
engine to every Arkhé component below. Mounts the announcer's live regions
with itself, and destroys its engine with itself.
-->
<script module lang="ts">
  import type { ArkheLabels, EffectsSetting, IconSet } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import type { IconComponent, LinkComponent } from './context.js';

  /**
   * Props of ArkheProvider.
   *
   * @interface ArkheProviderProps
   * @property {Partial<ArkheLabels>} [labels] - Translated label templates.
   * @property {string} [locale] - BCP 47 locale for plurals and numbers. Defaults to `en`.
   * @property {IconSet<IconComponent>} [icons] - Icons by Lucide name; win over Lucide.
   * @property {LinkComponent} [link] - Link renderer. Defaults to `a`.
   * @property {EffectsSetting} [effects] - Canvas effect options, or `false` for CSS skeletons everywhere. Read once.
   * @property {boolean} [hoverCards] - `false` opens hover cards on click only. Defaults to `true`.
   * @property {Snippet} children - App subtree.
   */
  export interface ArkheProviderProps {
    labels?: Partial<ArkheLabels>;
    locale?: string;
    icons?: IconSet<IconComponent>;
    link?: LinkComponent;
    effects?: EffectsSetting;
    hoverCards?: boolean;
    children: Snippet;
  }
</script>

<script lang="ts">
  import {
    Announcer,
    DEFAULT_LOCALE,
    FxLoader,
    resolveLabels,
  } from '@arkhe/core';
  import { untrack } from 'svelte';
  import { loadFx, provideArkhe } from './context.js';

  let {
    labels,
    locale,
    icons,
    link,
    effects,
    hoverCards,
    children,
  }: ArkheProviderProps = $props();
  const announcer = new Announcer();
  const engine = new FxLoader(untrack(() => effects) ?? {}, loadFx);
  $effect.pre(() => announcer.mount());
  $effect.pre(() => engine.mount());
  const value = $derived({
    labels: resolveLabels(labels),
    locale: locale ?? DEFAULT_LOCALE,
    icons: icons ? [icons] : [],
    link,
    announcer,
    effects: engine,
    hoverCards: hoverCards ?? true,
  });
  provideArkhe(() => value);
</script>

{@render children()}

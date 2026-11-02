<!--
@component
Supplies labels, icons and the link renderer to every Arkhé component below.
-->
<script lang="ts">
  import { resolveLabels, type ArkheLabels, type IconSet } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import {
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
   * @property {Snippet} children - App subtree.
   */
  interface Props {
    labels?: Partial<ArkheLabels>;
    icons?: IconSet<IconComponent>;
    link?: LinkComponent;
    children: Snippet;
  }

  let { labels, icons, link, children }: Props = $props();
  const value = $derived({
    labels: resolveLabels(labels),
    icons: icons ? [icons] : [],
    link,
  });
  provideArkhe(() => value);
</script>

{@render children()}

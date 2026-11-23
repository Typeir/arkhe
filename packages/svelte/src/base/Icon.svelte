<!--
@component
Draws the icon named `name` from the app's sets, then the bundled Lucide
default. Only Icon imports Lucide, so components without icons skip it. An
unknown name renders an empty slot marked `data-missing`.
-->
<script module lang="ts">
  /**
   * Props of Icon.
   *
   * @interface IconProps
   * @property {string} name - Lucide name, e.g. `triangle-alert`.
   * @property {string} [label] - Accessible name; without it the icon is decorative.
   */
  export interface IconProps {
    name: string;
    label?: string;
  }
</script>

<script lang="ts">
  import {
    ARKHE_CLASS,
    flag,
    hasText,
    partAttrs,
    resolveIcon,
  } from '@arkhe/core';
  import { useArkhe } from './context.js';
  import { LUCIDE_ICONS } from './lucideIcons.js';

  let { name, label }: IconProps = $props();
  const arkhe = useArkhe();
  const Glyph = $derived(resolveIcon([...arkhe().icons, LUCIDE_ICONS], name));
</script>

<span
  class={ARKHE_CLASS}
  {...partAttrs('icon', 'root')}
  data-name={name}
  data-missing={flag(!Glyph)}
  role={hasText(label) ? 'img' : undefined}
  aria-label={label}
  aria-hidden={hasText(label) ? undefined : true}>
  {#if Glyph}<Glyph aria-hidden={true} />{/if}
</span>

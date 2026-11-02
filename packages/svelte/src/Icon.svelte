<!--
@component
Draws the icon named `name` from the app's sets, then the bundled Lucide
default. Only Icon imports Lucide, so components without icons skip it. An
unknown name renders an empty slot marked `data-missing`.
-->
<script lang="ts">
  import { ARKHE_CLASS, flag, partAttrs, resolveIcon } from '@arkhe/core';
  import { useArkhe } from './context.js';
  import { LUCIDE_ICONS } from './lucideIcons.js';

  /**
   * Props of Icon.
   *
   * @interface Props
   * @property {string} name - Lucide name, e.g. `triangle-alert`.
   * @property {string} [label] - Accessible name; without it the icon is decorative.
   */
  interface Props {
    name: string;
    label?: string;
  }

  let { name, label }: Props = $props();
  const arkhe = useArkhe();
  const Glyph = $derived(resolveIcon([...arkhe().icons, LUCIDE_ICONS], name));
</script>

<span
  class={ARKHE_CLASS}
  {...partAttrs('icon', 'root')}
  data-name={name}
  data-missing={flag(!Glyph)}
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : true}>
  {#if Glyph}<Glyph aria-hidden={true} />{/if}
</span>

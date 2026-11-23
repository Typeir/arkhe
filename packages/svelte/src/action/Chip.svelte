<!--
@component
Renders a chip. The remove button's name comes from the `chipRemove` label;
when the host drops the chip, focus moves to the next chip's remove button.
-->
<script module lang="ts">
  /**
   * Colour of a chip.
   *
   * @typedef {'neutral' | 'accent' | 'emphasis' | 'warning' | 'danger'} ChipTone
   */
  export type ChipTone =
    'neutral' | 'accent' | 'emphasis' | 'warning' | 'danger';

  /**
   * Props of Chip.
   *
   * @interface ChipProps
   * @property {string} label - Text.
   * @property {ChipTone} [tone] - Colour. Defaults to `neutral`.
   * @property {string} [icon] - Lucide name of a leading icon.
   * @property {() => void} [onRemove] - Shows a remove button that calls this.
   */
  export interface ChipProps {
    label: string;
    tone?: ChipTone;
    icon?: string;
    onRemove?: () => void;
  }
</script>

<script lang="ts">
  import { ARKHE_CLASS, formatLabel, partAttrs, removeChip } from '@arkhe/core';
  import { useArkhe } from '../base/context.js';
  import Icon from '../base/Icon.svelte';

  let { label, tone = 'neutral', icon, onRemove }: ChipProps = $props();
  const arkhe = useArkhe();
  const removeLabel = $derived(
    formatLabel(arkhe().labels.chipRemove, { label }),
  );
</script>

<span class={ARKHE_CLASS} {...partAttrs('chip', 'root')} data-tone={tone}>
  {#if icon}<Icon name={icon} />{/if}
  <span {...partAttrs('chip', 'label')}>{label}</span>
  {#if onRemove}
    <button
      type="button"
      {...partAttrs('chip', 'remove')}
      aria-label={removeLabel}
      onclick={(event) => {
        removeChip(event.currentTarget, () => {
          onRemove?.();
        });
      }}>
      <Icon name="x" />
    </button>
  {/if}
</span>

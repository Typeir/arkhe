<!--
@component
Renders a chip. The remove button's name comes from the `chipRemove` label;
when the host drops the chip, focus moves to the next chip's remove button.
-->
<script lang="ts">
  import { ARKHE_CLASS, formatLabel, partAttrs, removeChip } from '@arkhe/core';
  import { useArkhe } from './context.js';
  import Icon from './Icon.svelte';

  /**
   * Props of Chip.
   *
   * @interface Props
   * @property {string} label - Text.
   * @property {'neutral' | 'accent' | 'emphasis' | 'warning' | 'danger'} [tone] - Colour. Defaults to `neutral`.
   * @property {string} [icon] - Lucide name of a leading icon.
   * @property {() => void} [onRemove] - Shows a remove button that calls this.
   */
  interface Props {
    label: string;
    tone?: 'neutral' | 'accent' | 'emphasis' | 'warning' | 'danger';
    icon?: string;
    onRemove?: () => void;
  }

  let { label, tone = 'neutral', icon, onRemove }: Props = $props();
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
      onclick={(event) => removeChip(event.currentTarget, () => onRemove?.())}>
      <Icon name="x" />
    </button>
  {/if}
</span>

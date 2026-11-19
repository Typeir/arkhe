<!--
@component
Renders a labelled text input that filters a list of options, reports every
choice and empties itself, for adding to a list kept elsewhere. At phone width
it opens a sheet that stays open while choices are added. On Zag's combobox
machine.
-->
<script lang="ts" generics="T extends SelectOption">
  import type { SelectOption, OptionFilter, Placement } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import ComboboxField from './ComboboxField.svelte';
  import { useNarrow } from './narrow.svelte.js';
  import SheetField from './SheetField.svelte';

  /**
   * Props of Picker.
   *
   * @interface Props
   * @property {string} label - Visible label.
   * @property {readonly T[]} items - Options; a repeated value is dropped.
   * @property {(item: T) => void} onSelect - Every choice, even a repeat.
   * @property {string} [placeholder] - Input placeholder.
   * @property {(text: string) => void} [onInputChange] - Every edit of the text.
   * @property {OptionFilter<T>} [filter] - Match rule; `false` when the host filters. Defaults to `matchOption`.
   * @property {boolean} [loading] - Shows the loading line instead of options.
   * @property {Snippet<[T]>} [item] - Option body. Defaults to label and description.
   * @property {boolean} [disabled] - Blocks input.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
   * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
   * @property {number} [rowPitch] - Row height in rem; draws only the rows in view, for long lists. Flat lists only.
   */
  interface Props {
    label: string;
    items: readonly T[];
    onSelect: (item: T) => void;
    placeholder?: string;
    onInputChange?: (text: string) => void;
    filter?: OptionFilter<T>;
    loading?: boolean;
    item?: Snippet<[T]>;
    disabled?: boolean;
    placement?: Placement;
    size?: 's' | 'm' | 'l';
    labelHidden?: boolean;
    rowPitch?: number;
  }

  let props: Props = $props();
  const narrow = useNarrow();
</script>

{#if narrow.current}
  <SheetField
    label={props.label}
    placeholder={props.placeholder}
    size={props.size}
    labelHidden={props.labelHidden}
    disabled={props.disabled}>
    <ComboboxField {...props} clearOnSelect labelHidden inline />
  </SheetField>
{:else}
  <ComboboxField {...props} clearOnSelect />
{/if}

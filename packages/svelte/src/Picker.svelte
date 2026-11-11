<!--
@component
Renders a labelled text input that filters a list of options, reports every
choice and empties itself, for adding to a list kept elsewhere. On Zag's
combobox machine.
-->
<script lang="ts" generics="T extends ComboboxOption">
  import type { ComboboxOption, OptionFilter, Placement } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import ComboboxField from './ComboboxField.svelte';

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
  }

  let props: Props = $props();
</script>

<ComboboxField {...props} clearOnSelect />

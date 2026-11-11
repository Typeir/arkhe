<!--
@component
Renders a labelled text input whose host supplies the results as the user
types, grouped when they name groups. Enter with nothing highlighted submits
the text. On Zag's combobox machine; nothing filters here.
-->
<script lang="ts" generics="T extends ComboboxOption">
  import type { ComboboxOption, Placement } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import ComboboxField from './ComboboxField.svelte';

  /**
   * Props of Search.
   *
   * @interface Props
   * @property {string} label - Visible label.
   * @property {readonly T[]} items - Results for the current text; a repeated value is dropped.
   * @property {(text: string) => void} onInputChange - Every edit of the text; the host answers with `items`.
   * @property {(text: string) => void} [onSubmit] - Takes the text on Enter when nothing is highlighted.
   * @property {(item: T) => void} [onSelect] - A result was chosen.
   * @property {string} [placeholder] - Input placeholder.
   * @property {boolean} [loading] - Shows the loading line instead of results.
   * @property {Snippet<[T]>} [item] - Result body. Defaults to label and description.
   * @property {boolean} [disabled] - Blocks input.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   */
  interface Props {
    label: string;
    items: readonly T[];
    onInputChange: (text: string) => void;
    onSubmit?: (text: string) => void;
    onSelect?: (item: T) => void;
    placeholder?: string;
    loading?: boolean;
    item?: Snippet<[T]>;
    disabled?: boolean;
    placement?: Placement;
  }

  let props: Props = $props();
</script>

<ComboboxField {...props} filter={false} />

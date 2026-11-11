<!--
@component
Renders one choice from a list of options: a button that opens the list
(Zag select) by default; with `searchable`, a text input that filters it
(Zag combobox).
-->
<script lang="ts" generics="T extends ComboboxOption">
  import type { ComboboxOption, OptionFilter, Placement } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import ComboboxField from './ComboboxField.svelte';
  import SelectMenu from './SelectMenu.svelte';

  /**
   * Props of Select.
   *
   * @interface Props
   * @property {string} label - Visible label.
   * @property {readonly T[]} items - Options; a repeated value is dropped.
   * @property {string} [placeholder] - Shown while nothing is chosen.
   * @property {string | null} [value] - Selected value; bindable. A function binding vetoes.
   * @property {string | null} [defaultValue] - First selection when uncontrolled.
   * @property {(value: string | null) => void} [onValueChange] - Reports selection changes.
   * @property {boolean} [searchable] - Filters the list as the user types.
   * @property {OptionFilter<T>} [filter] - Match rule when searchable. Defaults to `matchOption`.
   * @property {Snippet<[T]>} [item] - Option body. Defaults to label and description.
   * @property {string} [name] - Form field name; not searchable only.
   * @property {boolean} [required] - A value must be chosen; not searchable only.
   * @property {boolean} [disabled] - Blocks interaction.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   */
  interface Props {
    label: string;
    items: readonly T[];
    placeholder?: string;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    searchable?: boolean;
    filter?: OptionFilter<T>;
    item?: Snippet<[T]>;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    placement?: Placement;
  }

  let {
    value = $bindable(),
    searchable,
    filter,
    name,
    required,
    ...shared
  }: Props = $props();
</script>

{#if searchable}
  <ComboboxField bind:value {...shared} {filter} />
{:else}
  <SelectMenu bind:value {...shared} {name} {required} />
{/if}

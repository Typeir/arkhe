<!--
@component
Renders one choice from a list of options: a button that opens the list
(Zag select) by default; with `searchable`, a text input that filters it
(Zag combobox). At phone width it opens a sheet with a search box and the
list instead; choosing closes it.
-->
<script lang="ts" generics="T extends SelectOption">
  import type { SelectOption, OptionFilter, Placement } from '@arkhe/core';
  import { untrack, type Snippet } from 'svelte';
  import ComboboxField from './ComboboxField.svelte';
  import { useNarrow } from '../base/narrow.svelte.js';
  import SelectMenu from './SelectMenu.svelte';
  import SheetField from './SheetField.svelte';

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
   * @property {string} [name] - Form field name.
   * @property {boolean} [required] - A value must be chosen; searchable, the input must not be empty.
   * @property {string} [autoComplete] - Autofill hint, such as `country`; not searchable only.
   * @property {boolean} [disabled] - Blocks interaction.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   * @property {string} [emptyLabel] - Text of a first option that stands for no choice, such as "All".
   * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
   * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
   * @property {string} [hint] - Help text under the control.
   * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
   * @property {number} [rowPitch] - Row height in rem; draws only the rows in view, for long lists. Flat lists only.
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
    autoComplete?: string;
    disabled?: boolean;
    placement?: Placement;
    emptyLabel?: string;
    size?: 's' | 'm' | 'l';
    labelHidden?: boolean;
    hint?: string;
    error?: string;
    rowPitch?: number;
  }

  let {
    value = $bindable(),
    searchable,
    filter,
    name,
    required,
    autoComplete,
    ...shared
  }: Props = $props();
  const narrow = useNarrow();
  let inner = $state(untrack(() => shared.defaultValue ?? null));
  const current = $derived(value === undefined ? inner : value);
  const text = $derived(
    current === null
      ? shared.emptyLabel
      : shared.items.find((item) => item.value === current)?.label,
  );
  const choose = (next: string | null) => {
    inner = next;
    value = next;
    shared.onValueChange?.(next);
  };
</script>

{#if narrow.current}
  <SheetField
    label={shared.label}
    {text}
    placeholder={shared.placeholder}
    size={shared.size}
    labelHidden={shared.labelHidden}
    disabled={shared.disabled}
    {name}
    value={current}
    {required}
    hint={shared.hint}
    error={shared.error}>
    {#snippet children(close)}
      <ComboboxField
        {...shared}
        hint={undefined}
        error={undefined}
        value={current}
        labelHidden
        inline
        onValueChange={choose}
        onSelect={close} />
    {/snippet}
  </SheetField>
{:else if searchable}
  <ComboboxField bind:value {...shared} {filter} {name} {required} />
{:else}
  <SelectMenu bind:value {...shared} {name} {required} {autoComplete} />
{/if}

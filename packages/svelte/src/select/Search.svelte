<!--
@component
Renders a labelled text input whose host answers each query, grouped when
results name groups. Enter with nothing highlighted submits the text. Nothing
filters here: with `search`, each query runs the host's request once typing
pauses, aborting the one before, so the host filters where the data lives;
without it, the host answers `onInputChange` with `items`. At phone width it
opens a sheet that closes on a choice or a submit. On Zag's combobox
machine. Give `search`, or `items` with `onInputChange`.
-->
<script module lang="ts">
  import type { Placement, SearchRun, SelectOption } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of Search.
   *
   * @interface SearchProps
   * @template {SelectOption} T
   * @property {string} label - Visible label.
   * @property {SearchRun<T>} [search] - Runs the query where the data lives; aborted when a newer one starts.
   * @property {number} [debounce] - Milliseconds `search` waits for typing to pause. Defaults to `SEARCH_DEBOUNCE`.
   * @property {readonly T[]} [items] - Results for the current text, when the host answers `onInputChange` itself.
   * @property {(text: string) => void} [onInputChange] - Every edit of the text.
   * @property {(text: string) => void} [onSubmit] - Takes the text on Enter when nothing is highlighted.
   * @property {(item: T) => void} [onSelect] - A result was chosen.
   * @property {string} [placeholder] - Input placeholder.
   * @property {boolean} [loading] - A query is pending: shows the loading line, or dims `items` from the last one.
   * @property {Snippet<[T]>} [item] - Result body. Defaults to label and description.
   * @property {boolean} [disabled] - Blocks input.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
   * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
   * @property {string} [hint] - Help text under the control.
   * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
   * @property {number} [rowPitch] - Row height in rem; draws only the rows in view, for long lists. Flat lists only.
   */
  export interface SearchProps<T extends SelectOption> {
    label: string;
    search?: SearchRun<T>;
    debounce?: number;
    items?: readonly T[];
    onInputChange?: (text: string) => void;
    onSubmit?: (text: string) => void;
    onSelect?: (item: T) => void;
    placeholder?: string;
    loading?: boolean;
    item?: Snippet<[T]>;
    disabled?: boolean;
    placement?: Placement;
    size?: 's' | 'm' | 'l';
    labelHidden?: boolean;
    hint?: string;
    error?: string;
    rowPitch?: number;
  }
</script>

<script lang="ts" generics="T extends SelectOption">
  import {
    ARKHE_CLASS,
    partAttrs,
    searchBusy,
    SearchRequest,
    type SearchState,
  } from '@arkhe/core';
  import { onDestroy, untrack } from 'svelte';
  import { useNarrow } from '../base/narrow.svelte.js';
  import ComboboxField from './ComboboxField.svelte';
  import SheetField from './SheetField.svelte';

  let {
    label,
    search,
    debounce,
    items = [],
    onSubmit,
    onSelect,
    placeholder,
    loading,
    disabled,
    size,
    labelHidden,
    hint,
    error,
    ...rest
  }: SearchProps<T> = $props();
  let state = $state<SearchState<T>>({
    items: [],
    loading: false,
    failed: false,
  });
  const request = new SearchRequest<T>(
    (next) => (state = next),
    untrack(() => debounce),
  );
  onDestroy(() => {
    request.destroy();
  });
  const answered = $derived(search === undefined);
  const busy = $derived(
    answered
      ? searchBusy(Boolean(loading), items.length)
      : searchBusy(state.loading, state.items.length),
  );
  const narrow = useNarrow();
</script>

{#snippet field(close?: () => void)}
  <ComboboxField
    {...rest}
    {label}
    {placeholder}
    {disabled}
    {size}
    {labelHidden}
    {hint}
    {error}
    {onSelect}
    {onSubmit}
    items={answered ? items : state.items}
    loading={busy.loading}
    stale={busy.stale}
    failed={!answered && state.failed}
    filter={false}
    enterKeyHint="search"
    onQuery={(text) => {
      if (search) request.query(text, search);
    }}
    {...close
      ? {
          labelHidden: true,
          hint: undefined,
          error: undefined,
          inline: true,
          onSelect: (item: T) => {
            onSelect?.(item);
            close();
          },
          onSubmit: (text: string) => {
            onSubmit?.(text);
            close();
          },
        }
      : {}} />
{/snippet}

<search class={ARKHE_CLASS} {...partAttrs('search', 'root')}>
  {#if narrow.current}
    <SheetField
      {label}
      {placeholder}
      {size}
      {labelHidden}
      {disabled}
      {hint}
      {error}>
      {#snippet children(close)}{@render field(close)}{/snippet}
    </SheetField>
  {:else}
    {@render field()}
  {/if}
</search>

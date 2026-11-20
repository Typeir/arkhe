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
<script lang="ts" generics="T extends SelectOption">
  import {
    ARKHE_CLASS,
    SearchRequest,
    partAttrs,
    type Placement,
    type SearchRun,
    type SearchState,
    type SelectOption,
  } from '@arkhe/core';
  import { onDestroy, untrack, type Snippet } from 'svelte';
  import ComboboxField from './ComboboxField.svelte';
  import { useNarrow } from '../base/narrow.svelte.js';
  import SheetField from './SheetField.svelte';

  /**
   * Props of Search.
   *
   * @interface Props
   * @property {string} label - Visible label.
   * @property {SearchRun<T>} [search] - Runs the query where the data lives; aborted when a newer one starts.
   * @property {number} [debounce] - Milliseconds `search` waits for typing to pause. Defaults to `SEARCH_DEBOUNCE`.
   * @property {readonly T[]} [items] - Results for the current text, when the host answers `onInputChange` itself.
   * @property {(text: string) => void} [onInputChange] - Every edit of the text.
   * @property {(text: string) => void} [onSubmit] - Takes the text on Enter when nothing is highlighted.
   * @property {(item: T) => void} [onSelect] - A result was chosen.
   * @property {string} [placeholder] - Input placeholder.
   * @property {boolean} [loading] - Shows the loading line instead of `items`.
   * @property {Snippet<[T]>} [item] - Result body. Defaults to label and description.
   * @property {boolean} [disabled] - Blocks input.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
   * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
   * @property {string} [hint] - Help text under the control.
   * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
   * @property {number} [rowPitch] - Row height in rem; draws only the rows in view, for long lists. Flat lists only.
   */
  interface Props {
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

  let { search, debounce, items = [], loading, ...rest }: Props = $props();
  let state = $state<SearchState<T>>({
    items: [],
    loading: false,
    failed: false,
  });
  const request = new SearchRequest<T>(
    (next) => (state = next),
    untrack(() => debounce),
  );
  onDestroy(() => request.dispose());
  const answered = $derived(search === undefined);
  const narrow = useNarrow();
</script>

{#snippet field(close?: () => void)}
  <ComboboxField
    {...rest}
    items={answered ? items : state.items}
    loading={answered ? loading : state.loading && state.items.length === 0}
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
            rest.onSelect?.(item);
            close();
          },
          onSubmit: (text: string) => {
            rest.onSubmit?.(text);
            close();
          },
        }
      : {}} />
{/snippet}

<div class={ARKHE_CLASS} {...partAttrs('search', 'root')} role="search">
  {#if narrow.current}
    <SheetField
      label={rest.label}
      placeholder={rest.placeholder}
      size={rest.size}
      labelHidden={rest.labelHidden}
      disabled={rest.disabled}
      hint={rest.hint}
      error={rest.error}>
      {#snippet children(close)}{@render field(close)}{/snippet}
    </SheetField>
  {:else}
    {@render field()}
  {/if}
</div>

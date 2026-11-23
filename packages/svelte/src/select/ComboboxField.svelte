<!--
@component
Renders a labelled text input that filters a list of options, on Zag's
combobox machine, with the list portalled into the environment's container.
Not exported: it is the body of the searchable Select, of Picker and of
Search. Tab completes the highlighted option. The list filters, and the host
hears the new text, once Svelte has flushed the keystroke: a list change
inside it makes Zag move the caret to the end of the text. Both still land
before the next key, so Enter never acts on a stale list. The list portals in
once mounted on the client, so server markup holds none.
-->
<script module lang="ts">
  import type { OptionFilter, Placement, SelectOption } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of ComboboxField.
   *
   * @interface ComboboxFieldProps
   * @template {SelectOption} T
   * @property {string} label - Visible label.
   * @property {readonly T[]} items - Options; a repeated value is dropped.
   * @property {string} [placeholder] - Input placeholder.
   * @property {string | null} [value] - Selected value; bindable. A function binding vetoes.
   * @property {string | null} [defaultValue] - First selection when uncontrolled.
   * @property {(value: string | null) => void} [onValueChange] - Reports selection changes.
   * @property {(item: T) => void} [onSelect] - Every choice, even a repeat.
   * @property {boolean} [clearOnSelect] - Picker mode: empties the input after a choice.
   * @property {(text: string) => void} [onInputChange] - Every edit of the text.
   * @property {(text: string) => void} [onQuery] - Text the user typed; not text a choice or clear wrote.
   * @property {OptionFilter<T>} [filter] - Match rule; `false` when the host filters.
   * @property {boolean} [loading] - Shows the loading line instead of options.
   * @property {boolean} [failed] - Shows the error line instead of options.
   * @property {boolean} [stale] - Dims the options while newer ones load.
   * @property {(text: string) => void} [onSubmit] - Takes free text on Enter when nothing is highlighted.
   * @property {Snippet<[T]>} [item] - Option body. Defaults to label and description.
   * @property {boolean} [disabled] - Blocks input.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   * @property {string} [emptyLabel] - Text of a first option that stands for no choice, such as "All".
   * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
   * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
   * @property {boolean} [inline] - Renders the list in place and always shown, as inside a sheet; the input empties and the list opens as it takes focus.
   * @property {string} [name] - Form field name; a hidden input carries the value.
   * @property {string} [hint] - Help text under the control.
   * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
   * @property {'search' | 'done' | 'go' | 'next' | 'enter'} [enterKeyHint] - Label of the on-screen keyboard's Enter key.
   * @property {boolean} [required] - The input must not be empty.
   * @property {number} [rowPitch] - Row height in rem; draws only the rows in view. Flat lists only.
   */
  export interface ComboboxFieldProps<T extends SelectOption> {
    label: string;
    items: readonly T[];
    placeholder?: string;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
    onSelect?: (item: T) => void;
    clearOnSelect?: boolean;
    onInputChange?: (text: string) => void;
    onQuery?: (text: string) => void;
    filter?: OptionFilter<T>;
    loading?: boolean;
    failed?: boolean;
    stale?: boolean;
    onSubmit?: (text: string) => void;
    item?: Snippet<[T]>;
    disabled?: boolean;
    placement?: Placement;
    emptyLabel?: string;
    size?: 's' | 'm' | 'l';
    labelHidden?: boolean;
    inline?: boolean;
    name?: string;
    hint?: string;
    error?: string;
    enterKeyHint?: 'search' | 'done' | 'go' | 'next' | 'enter';
    required?: boolean;
    rowPitch?: number;
  }
</script>

<script lang="ts" generics="T extends SelectOption">
  import {
    ARKHE_CLASS,
    comboboxMachineProps,
    EMPTY_VALUE,
    fieldDescribedBy,
    fieldIds,
    filterOptions,
    flag,
    fromEmptyValue,
    guardComboboxKeys,
    isGrouped,
    listNote,
    optionCollection,
    partAttrs,
    queryAfterChange,
    SVELTE_EVENTS,
    toEmptyValue,
    withEmptyOption,
  } from '@arkhe/core';
  import * as combobox from '@zag-js/combobox';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { tick } from 'svelte';
  import { useArkhe } from '../base/context.js';
  import { useArkheEnvironment } from '../base/environment.js';
  import Icon from '../base/Icon.svelte';
  import { useMounted } from '../base/mounted.svelte.js';
  import FieldNote from '../field/FieldNote.svelte';
  import { useVirtualRows } from '../list/virtualRows.svelte.js';
  import ComboboxList from './ComboboxList.svelte';

  let {
    label,
    items,
    placeholder,
    value = $bindable(),
    defaultValue,
    onValueChange,
    onSelect,
    clearOnSelect,
    onInputChange,
    onQuery,
    filter,
    loading,
    failed,
    stale,
    onSubmit,
    item,
    disabled,
    placement,
    emptyLabel,
    size,
    labelHidden,
    inline,
    name,
    hint,
    error,
    enterKeyHint,
    required,
    rowPitch,
  }: ComboboxFieldProps<T> = $props();
  const id = $props.id();
  const ids = fieldIds(id);
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  let query = $state('');
  const options = $derived(withEmptyOption(items, emptyLabel) as readonly T[]);
  const shown = $derived(filterOptions(options, query, filter));
  const collection = $derived(combobox.collection(optionCollection(shown)));
  const rows = useVirtualRows(
    () => shown.length,
    () => (isGrouped(shown) ? undefined : rowPitch),
  );
  const note = $derived(listNote(loading, failed, shown.length));
  const commit = (next: string | null) => {
    value = next;
    onValueChange?.(next);
  };
  const service = useMachine(combobox.machine, () => ({
    ...comboboxMachineProps({
      id,
      label,
      labels: arkhe().labels,
      locale: arkhe().locale,
      value: toEmptyValue(value, emptyLabel),
      defaultValue: toEmptyValue(defaultValue ?? null, emptyLabel),
      clearOnSelect,
      submits: onSubmit !== undefined,
      loading,
      disabled,
      required,
      invalid: Boolean(error),
      placeholder,
      placement,
      getRootNode: env().getRootNode,
    }),
    ...(inline && !clearOnSelect
      ? { selectionBehavior: 'preserve' as const }
      : {}),
    ...(rows.on ? { scrollToIndexFn: rows.scrollTo } : {}),
    collection,
    onInputValueChange: (details: combobox.InputValueChangeDetails) => {
      const next = queryAfterChange(details);
      void tick().then(() => {
        query = next;
        onInputChange?.(details.inputValue);
        if (details.reason === 'input-change') onQuery?.(details.inputValue);
      });
    },
    onValueChange: (details: combobox.ValueChangeDetails<T>) => {
      commit(fromEmptyValue(details.value[0] ?? null));
    },
    onSelect: (details: combobox.SelectionDetails) => {
      const chosen = options.find((entry) => entry.value === details.itemValue);
      if (chosen) onSelect?.(chosen);
    },
  }));
  const api = $derived(combobox.connect(service, normalizeProps));
  const mounted = useMounted();
  const inputProps = $derived(
    mergeProps(
      guardComboboxKeys(
        api.getInputProps(),
        {
          highlighted: () => api.highlightedValue,
          inputValue: () => api.inputValue,
          select: (next) => {
            api.selectValue(next);
          },
          close: () => {
            api.setOpen(false);
          },
          submit: onSubmit,
        },
        SVELTE_EVENTS,
      ),
      inline
        ? {
            onfocus: () => {
              api.setInputValue('');
              api.setOpen(true);
            },
          }
        : {},
      {
        enterkeyhint: enterKeyHint,
        'aria-describedby': fieldDescribedBy(ids, hint, error),
      },
    ),
  );
</script>

{#snippet option(entry: T, index: number)}
  <div {...api.getItemProps({ item: entry })} {...rows.position(index)}>
    {#if item && !(entry.value === EMPTY_VALUE && emptyLabel !== undefined)}
      {@render item(entry)}
    {:else}
      {#if entry.icon}<Icon name={entry.icon} />{/if}
      <span {...partAttrs('combobox', 'item-label')}>{entry.label}</span>
      {#if entry.description}
        <span {...partAttrs('combobox', 'item-description')}
          >{entry.description}</span>
      {/if}
    {/if}
  </div>
{/snippet}

{#snippet list()}
  <ComboboxList
    {api}
    {collection}
    {shown}
    {note}
    emptyText={arkhe().labels.selectEmpty}
    {option}
    {inline}
    {rows}
    {stale} />
{/snippet}

<div
  {...mergeProps(api.getRootProps(), {
    class: ARKHE_CLASS,
    'data-size': size,
    'data-label-hidden': flag(labelHidden),
  })}>
  <label {...api.getLabelProps()}>{label}</label>
  <div {...api.getControlProps()}>
    <input {...inputProps} />
    <button {...api.getClearTriggerProps()}><Icon name="x" /></button>
    {#if !inline}
      <button {...api.getTriggerProps()}><Icon name="chevron-down" /></button>
    {/if}
  </div>
  <FieldNote {ids} {hint} {error} />
  {#if name !== undefined}
    <input
      type="hidden"
      {name}
      value={fromEmptyValue(api.value[0] ?? null) ?? ''} />
  {/if}
  {#if inline}
    {@render list()}
  {:else if mounted.current}
    <div
      class={ARKHE_CLASS}
      use:portal={{
        container: env().container(),
        getRootNode: env().getRootNode,
      }}>
      <div {...api.getPositionerProps()}>{@render list()}</div>
    </div>
  {/if}
</div>

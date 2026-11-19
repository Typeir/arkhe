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
<script lang="ts" generics="T extends SelectOption">
  import {
    ARKHE_CLASS,
    EMPTY_VALUE,
    SVELTE_EVENTS,
    comboboxMachineProps,
    flag,
    fromEmptyValue,
    filterOptions,
    guardComboboxKeys,
    isGrouped,
    optionCollection,
    queryAfterChange,
    toEmptyValue,
    withEmptyOption,
    type SelectOption,
    type OptionFilter,
    type Placement,
  } from '@arkhe/core';
  import * as combobox from '@zag-js/combobox';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { onMount, tick, type Snippet } from 'svelte';
  import { useArkhe } from './context.js';
  import { useArkheEnvironment } from './environment.js';
  import ComboboxList from './ComboboxList.svelte';
  import Icon from './Icon.svelte';
  import { useVirtualRows } from './virtualRows.svelte.js';

  /**
   * Props of ComboboxField.
   *
   * @interface Props
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
   * @property {(text: string) => void} [onSubmit] - Takes free text on Enter when nothing is highlighted.
   * @property {Snippet<[T]>} [item] - Option body. Defaults to label and description.
   * @property {boolean} [disabled] - Blocks input.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   * @property {string} [emptyLabel] - Text of a first option that stands for no choice, such as "All".
   * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
   * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
   * @property {boolean} [inline] - Renders the list in place and always shown, as inside a sheet; the input empties and the list opens as it takes focus.
   * @property {string} [name] - Form field name; a hidden input carries the value.
   * @property {'search' | 'done' | 'go' | 'next' | 'enter'} [enterKeyHint] - Label of the on-screen keyboard's Enter key.
   * @property {boolean} [required] - The input must not be empty.
   * @property {number} [rowPitch] - Row height in rem; draws only the rows in view. Flat lists only.
   */
  interface Props {
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
    onSubmit?: (text: string) => void;
    item?: Snippet<[T]>;
    disabled?: boolean;
    placement?: Placement;
    emptyLabel?: string;
    size?: 's' | 'm' | 'l';
    labelHidden?: boolean;
    inline?: boolean;
    name?: string;
    enterKeyHint?: 'search' | 'done' | 'go' | 'next' | 'enter';
    required?: boolean;
    rowPitch?: number;
  }

  let { value = $bindable(), ...props }: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  let query = $state('');
  const items = $derived(
    withEmptyOption(props.items, props.emptyLabel) as readonly T[],
  );
  const shown = $derived(filterOptions(items, query, props.filter));
  const collection = $derived(combobox.collection(optionCollection(shown)));
  const rows = useVirtualRows(
    () => shown.length,
    () => (isGrouped(shown) ? undefined : props.rowPitch),
  );
  const note = $derived(
    props.loading
      ? 'loading'
      : props.failed
        ? 'failed'
        : shown.length === 0
          ? 'empty'
          : undefined,
  );
  const service = useMachine(combobox.machine, () => ({
    ...comboboxMachineProps({
      id,
      label: props.label,
      labels: arkhe().labels,
      locale: arkhe().locale,
      value: toEmptyValue(value, props.emptyLabel),
      defaultValue: toEmptyValue(props.defaultValue ?? null, props.emptyLabel),
      clearOnSelect: props.clearOnSelect,
      submits: props.onSubmit !== undefined,
      loading: props.loading,
      disabled: props.disabled,
      required: props.required,
      placeholder: props.placeholder,
      placement: props.placement,
      getRootNode: env().getRootNode,
    }),
    ...(props.inline && !props.clearOnSelect
      ? { selectionBehavior: 'preserve' as const }
      : {}),
    ...(rows.on ? { scrollToIndexFn: rows.scrollTo } : {}),
    collection,
    onInputValueChange: (details: combobox.InputValueChangeDetails) => {
      const next = queryAfterChange(details);
      void tick().then(() => {
        query = next;
        props.onInputChange?.(details.inputValue);
        if (details.reason === 'input-change')
          props.onQuery?.(details.inputValue);
      });
    },
    onValueChange: (details: combobox.ValueChangeDetails<T>) => {
      const next = fromEmptyValue(details.value[0] ?? null);
      value = next;
      props.onValueChange?.(next);
    },
    onSelect: (details: combobox.SelectionDetails) => {
      const chosen = items.find((option) => option.value === details.itemValue);
      if (chosen) props.onSelect?.(chosen);
    },
  }));
  const api = $derived(combobox.connect(service, normalizeProps));
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });
  const inputProps = $derived(
    mergeProps(
      guardComboboxKeys(
        api.getInputProps(),
        {
          highlighted: () => api.highlightedValue,
          inputValue: () => api.inputValue,
          select: (value) => api.selectValue(value),
          close: () => api.setOpen(false),
          submit: props.onSubmit,
        },
        SVELTE_EVENTS,
      ),
      props.inline
        ? {
            onfocus: () => {
              api.setInputValue('');
              api.setOpen(true);
            },
          }
        : {},
      { enterkeyhint: props.enterKeyHint },
    ),
  );
</script>

{#snippet option(entry: T, index: number)}
  <div {...api.getItemProps({ item: entry })} {...rows.position(index)}>
    {#if props.item && !(entry.value === EMPTY_VALUE && props.emptyLabel !== undefined)}
      {@render props.item(entry)}
    {:else}
      {#if entry.icon}<Icon name={entry.icon} />{/if}
      <span data-scope="combobox" data-part="item-label">{entry.label}</span>
      {#if entry.description}
        <span data-scope="combobox" data-part="item-description"
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
    inline={props.inline}
    {rows} />
{/snippet}

<div
  {...mergeProps(api.getRootProps(), {
    class: ARKHE_CLASS,
    'data-size': props.size,
    'data-label-hidden': flag(props.labelHidden),
  })}>
  <label {...api.getLabelProps()}>{props.label}</label>
  <div {...api.getControlProps()}>
    <input {...inputProps} />
    <button {...api.getClearTriggerProps()}><Icon name="x" /></button>
    {#if !props.inline}
      <button {...api.getTriggerProps()}><Icon name="chevron-down" /></button>
    {/if}
  </div>
  {#if props.name !== undefined}
    <input
      type="hidden"
      name={props.name}
      value={fromEmptyValue(api.value[0] ?? null) ?? ''} />
  {/if}
  {#if props.inline}
    {@render list()}
  {:else if mounted}
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

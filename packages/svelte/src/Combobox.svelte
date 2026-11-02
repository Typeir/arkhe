<!--
@component
Renders a labelled text input that filters a list of options, on Zag's
combobox machine, with the list portalled into the environment's container.
Serves three jobs: a searchable select, a picker that adds the chosen option
elsewhere and empties itself, and a search box whose host supplies results
and takes free text on Enter. Tab completes the highlighted option. The list
filters once Svelte has flushed the keystroke: a list change inside it makes
Zag move the caret to the end of the text. The filter still lands before the
next key, so Enter never acts on a stale list.
-->
<script lang="ts" generics="T extends ComboboxOption">
  import {
    ARKHE_CLASS,
    SVELTE_EVENTS,
    comboboxMachineProps,
    filterOptions,
    guardComboboxKeys,
    isGrouped,
    optionCollection,
    queryAfterChange,
    slug,
    type ComboboxOption,
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
  import { tick, type Snippet } from 'svelte';
  import { useArkhe } from './context.js';
  import { useArkheEnvironment } from './environment.js';
  import Icon from './Icon.svelte';
  import Status from './Status.svelte';

  /**
   * Props of Combobox.
   *
   * @interface Props
   * @property {string} label - Visible label.
   * @property {readonly T[]} items - Options; a repeated value is dropped.
   * @property {string} [placeholder] - Input placeholder.
   * @property {string | null} [value] - Selected value; makes the selection controlled.
   * @property {string | null} [defaultValue] - First selection when uncontrolled.
   * @property {(value: string | null) => void} [onValueChange] - Selection changes.
   * @property {(item: T) => void} [onSelect] - Every choice, even a repeat.
   * @property {boolean} [clearOnSelect] - Picker mode: empties the input after a choice.
   * @property {(text: string) => void} [onInputChange] - Every edit of the text.
   * @property {OptionFilter<T>} [filter] - Match rule; `false` when the host filters.
   * @property {boolean} [loading] - Shows the loading line instead of options.
   * @property {(text: string) => void} [onSubmit] - Takes free text on Enter when nothing is highlighted.
   * @property {Snippet<[T]>} [item] - Option body. Defaults to label and description.
   * @property {boolean} [disabled] - Blocks input.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
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
    filter?: OptionFilter<T>;
    loading?: boolean;
    onSubmit?: (text: string) => void;
    item?: Snippet<[T]>;
    disabled?: boolean;
    placement?: Placement;
  }

  const props: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  let query = $state('');
  const shown = $derived(filterOptions(props.items, query, props.filter));
  const collection = $derived(combobox.collection(optionCollection(shown)));
  const service = useMachine(combobox.machine, () => ({
    ...comboboxMachineProps({
      id,
      label: props.label,
      labels: arkhe().labels,
      value: props.value,
      defaultValue: props.defaultValue,
      clearOnSelect: props.clearOnSelect,
      submits: props.onSubmit !== undefined,
      loading: props.loading,
      disabled: props.disabled,
      placeholder: props.placeholder,
      placement: props.placement,
      getRootNode: env().getRootNode,
    }),
    collection,
    onInputValueChange: (details: combobox.InputValueChangeDetails) => {
      const next = queryAfterChange(details);
      void tick().then(() => (query = next));
      props.onInputChange?.(details.inputValue);
    },
    onValueChange: (details: combobox.ValueChangeDetails<T>) =>
      props.onValueChange?.(details.value[0] ?? null),
    onSelect: (details: combobox.SelectionDetails) => {
      const chosen = props.items.find(
        (option) => option.value === details.itemValue,
      );
      if (chosen) props.onSelect?.(chosen);
    },
  }));
  const api = $derived(combobox.connect(service, normalizeProps));
  const inputProps = $derived(
    guardComboboxKeys(
      api.getInputProps(),
      {
        highlighted: () => api.highlightedValue,
        inputValue: () => api.inputValue,
        select: (value) => api.selectValue(value),
        submit: props.onSubmit,
      },
      SVELTE_EVENTS,
    ),
  );
</script>

{#snippet option(entry: T)}
  <div {...api.getItemProps({ item: entry })}>
    {#if props.item}
      {@render props.item(entry)}
    {:else}
      <span data-scope="combobox" data-part="item-label">{entry.label}</span>
      {#if entry.description}
        <span data-scope="combobox" data-part="item-description"
          >{entry.description}</span>
      {/if}
    {/if}
  </div>
{/snippet}

<div {...mergeProps(api.getRootProps(), { class: ARKHE_CLASS })}>
  <label {...api.getLabelProps()}>{props.label}</label>
  <div {...api.getControlProps()}>
    <input {...inputProps} />
    <button {...api.getClearTriggerProps()}><Icon name="x" /></button>
    <button {...api.getTriggerProps()}><Icon name="chevron-down" /></button>
  </div>
  <div
    class={ARKHE_CLASS}
    use:portal={{
      container: env().container(),
      getRootNode: env().getRootNode,
    }}>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        {#if props.loading}
          <Status kind="loading" />
        {:else if shown.length === 0}
          <div data-scope="combobox" data-part="empty">
            {arkhe().labels.comboboxEmpty}
          </div>
        {:else if isGrouped(shown)}
          {#each collection.group() as [group, members] (group)}
            <div {...api.getItemGroupProps({ id: slug(group) })}>
              <div {...api.getItemGroupLabelProps({ htmlFor: slug(group) })}>
                {group}
              </div>
              {#each members as entry (entry.value)}
                {@render option(entry)}
              {/each}
            </div>
          {/each}
        {:else}
          {#each shown as entry (entry.value)}
            {@render option(entry)}
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

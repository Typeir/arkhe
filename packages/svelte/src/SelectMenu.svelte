<!--
@component
Renders a labelled button that opens a list of options, on Zag's select
machine, with the list portalled into the environment's container. Not
exported: it is the body of Select when not searchable. A hidden native
select mirrors the value for forms. The list portals in once mounted on the
client, so server markup holds none.
-->
<script lang="ts" generics="T extends ComboboxOption">
  import {
    ARKHE_CLASS,
    isGrouped,
    optionCollection,
    selectMachineProps,
    slug,
    uniqueByValue,
    type ComboboxOption,
    type Placement,
  } from '@arkhe/core';
  import * as select from '@zag-js/select';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { onMount, type Snippet } from 'svelte';
  import { useArkhe } from './context.js';
  import { useArkheEnvironment } from './environment.js';
  import Icon from './Icon.svelte';

  /**
   * Props of SelectMenu.
   *
   * @interface Props
   * @property {string} label - Visible label.
   * @property {readonly T[]} items - Options; a repeated value is dropped.
   * @property {string} [placeholder] - Shown while nothing is chosen.
   * @property {string | null} [value] - Selected value; bindable. A function binding vetoes.
   * @property {string | null} [defaultValue] - First selection when uncontrolled.
   * @property {(value: string | null) => void} [onValueChange] - Reports selection changes.
   * @property {Snippet<[T]>} [item] - Option body. Defaults to label and description.
   * @property {string} [name] - Form field name.
   * @property {boolean} [required] - A value must be chosen.
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
    item?: Snippet<[T]>;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    placement?: Placement;
  }

  let { value = $bindable(), ...props }: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const shown = $derived(uniqueByValue(props.items));
  const collection = $derived(select.collection(optionCollection(shown)));
  const service = useMachine(select.machine, () => ({
    ...selectMachineProps({
      id,
      label: props.label,
      labels: arkhe().labels,
      value,
      defaultValue: props.defaultValue,
      name: props.name,
      required: props.required,
      disabled: props.disabled,
      placement: props.placement,
      getRootNode: env().getRootNode,
    }),
    collection,
    onValueChange: (details: select.ValueChangeDetails<T>) => {
      const next = details.value[0] ?? null;
      value = next;
      props.onValueChange?.(next);
    },
  }));
  const api = $derived(select.connect(service, normalizeProps));
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });
</script>

{#snippet option(entry: T)}
  <div {...api.getItemProps({ item: entry })}>
    {#if props.item}
      {@render props.item(entry)}
    {:else}
      <span data-scope="select" data-part="item-label">{entry.label}</span>
      {#if entry.description}
        <span data-scope="select" data-part="item-description"
          >{entry.description}</span>
      {/if}
    {/if}
  </div>
{/snippet}

<div {...mergeProps(api.getRootProps(), { class: ARKHE_CLASS })}>
  <label {...api.getLabelProps()}>{props.label}</label>
  <div {...api.getControlProps()}>
    <button {...api.getTriggerProps()}
      ><span {...api.getValueTextProps()}
        >{api.valueAsString || props.placeholder || ''}</span
      ><span {...api.getIndicatorProps()}><Icon name="chevron-down" /></span
      ></button>
  </div>
  <select {...api.getHiddenSelectProps()}>
    <option value=""></option>
    {#each shown as entry (entry.value)}
      <option value={entry.value} disabled={entry.disabled}
        >{entry.label}</option>
    {/each}
  </select>
  {#if mounted}
    <div
      class={ARKHE_CLASS}
      use:portal={{
        container: env().container(),
        getRootNode: env().getRootNode,
      }}>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          {#if isGrouped(shown)}
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
  {/if}
</div>

<!--
@component
Renders a labelled button that opens a list of options, on Zag's select
machine, with the list portalled into the environment's container. Not
exported: it is the body of Select when not searchable. A hidden native
select mirrors the value for forms; with virtual rows it holds only the chosen
option. The list portals in once mounted on the client, so server markup
holds none.
-->
<script module lang="ts">
  import type { Placement, SelectOption } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of SelectMenu.
   *
   * @interface SelectMenuProps
   * @template {SelectOption} T
   * @property {string} label - Visible label.
   * @property {readonly T[]} items - Options; a repeated value is dropped.
   * @property {string} [placeholder] - Shown while nothing is chosen.
   * @property {string | null} [value] - Selected value; bindable. A function binding vetoes.
   * @property {string | null} [defaultValue] - First selection when uncontrolled.
   * @property {(value: string | null) => void} [onValueChange] - Reports selection changes.
   * @property {Snippet<[T]>} [item] - Option body. Defaults to label and description.
   * @property {string} [name] - Form field name.
   * @property {boolean} [required] - A value must be chosen.
   * @property {string} [autoComplete] - Autofill hint of the hidden native select, such as `country`.
   * @property {boolean} [disabled] - Blocks interaction.
   * @property {Placement} [placement] - Side of the list. Defaults to `bottom-start`.
   * @property {string} [emptyLabel] - Text of a first option that stands for no choice, such as "All".
   * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
   * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
   * @property {string} [hint] - Help text under the control.
   * @property {string} [error] - Error text; replaces the hint and marks the control invalid.
   * @property {number} [rowPitch] - Row height in rem; draws only the rows in view. Flat lists only.
   */
  export interface SelectMenuProps<T extends SelectOption> {
    label: string;
    items: readonly T[];
    placeholder?: string;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null) => void;
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
</script>

<script lang="ts" generics="T extends SelectOption">
  import {
    ARKHE_CLASS,
    EMPTY_VALUE,
    fieldDescribedBy,
    fieldIds,
    flag,
    fromEmptyValue,
    isGrouped,
    optionCollection,
    partAttrs,
    selectMachineProps,
    slug,
    toEmptyValue,
    uniqueByValue,
    withEmptyOption,
  } from '@arkhe/core';
  import * as select from '@zag-js/select';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { useArkhe } from '../base/context.js';
  import { useArkheEnvironment } from '../base/environment.js';
  import Icon from '../base/Icon.svelte';
  import { useMounted } from '../base/mounted.svelte.js';
  import FieldNote from '../field/FieldNote.svelte';
  import { useVirtualRows } from '../list/virtualRows.svelte.js';

  let {
    label,
    items,
    placeholder,
    value = $bindable(),
    defaultValue,
    onValueChange,
    item,
    name,
    required,
    autoComplete,
    disabled,
    placement,
    emptyLabel,
    size,
    labelHidden,
    hint,
    error,
    rowPitch,
  }: SelectMenuProps<T> = $props();
  const id = $props.id();
  const ids = fieldIds(id);
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const shown = $derived(
    uniqueByValue(withEmptyOption(items, emptyLabel)) as readonly T[],
  );
  const collection = $derived(select.collection(optionCollection(shown)));
  const rows = useVirtualRows(
    () => shown.length,
    () => (isGrouped(shown) ? undefined : rowPitch),
  );
  const commit = (next: string | null) => {
    value = next;
    onValueChange?.(next);
  };
  const service = useMachine(select.machine, () => ({
    ...selectMachineProps({
      id,
      label,
      labels: arkhe().labels,
      value: toEmptyValue(value, emptyLabel),
      defaultValue: toEmptyValue(defaultValue ?? null, emptyLabel),
      name,
      required,
      invalid: Boolean(error),
      autoComplete,
      disabled,
      placement,
      getRootNode: env().getRootNode,
    }),
    ...(rows.on ? { scrollToIndexFn: rows.scrollTo } : {}),
    collection,
    onValueChange: (details: select.ValueChangeDetails<T>) => {
      commit(fromEmptyValue(details.value[0] ?? null));
    },
  }));
  const api = $derived(select.connect(service, normalizeProps));
  const mounted = useMounted();
</script>

{#snippet option(entry: T, index: number)}
  <div {...api.getItemProps({ item: entry })} {...rows.position(index)}>
    {#if item && !(entry.value === EMPTY_VALUE && emptyLabel !== undefined)}
      {@render item(entry)}
    {:else}
      {#if entry.icon}<Icon name={entry.icon} />{/if}
      <span {...partAttrs('select', 'item-label')}>{entry.label}</span>
      {#if entry.description}
        <span {...partAttrs('select', 'item-description')}
          >{entry.description}</span>
      {/if}
    {/if}
  </div>
{/snippet}

<div
  {...mergeProps(api.getRootProps(), {
    class: ARKHE_CLASS,
    'data-size': size,
    'data-label-hidden': flag(labelHidden),
  })}>
  <label {...api.getLabelProps()}>{label}</label>
  <div {...api.getControlProps()}>
    <button
      {...api.getTriggerProps()}
      aria-describedby={fieldDescribedBy(ids, hint, error)}
      ><span {...api.getValueTextProps()}
        >{api.valueAsString || (placeholder ?? '')}</span
      ><span {...api.getIndicatorProps()}><Icon name="chevron-down" /></span
      ></button>
  </div>
  <FieldNote {ids} {hint} {error} />
  <select {...api.getHiddenSelectProps()}>
    <option value="">{emptyLabel ?? ''}</option>
    {#each shown.filter((entry) => entry.value !== EMPTY_VALUE && (!rows.on || api.value.includes(entry.value))) as entry (entry.value)}
      <option value={entry.value} disabled={entry.disabled}
        >{entry.label}</option>
    {/each}
  </select>
  {#if mounted.current}
    <div
      class={ARKHE_CLASS}
      use:portal={{
        container: env().container(),
        getRootNode: env().getRootNode,
      }}>
      <div {...api.getPositionerProps()}>
        <div
          {...api.getContentProps()}
          {@attach rows.attach}
          style:--row-pitch={rows.vars?.['--row-pitch']}
          style:--virtual-before={rows.vars?.['--virtual-before']}
          style:--virtual-after={rows.vars?.['--virtual-after']}
          data-virtual={flag(rows.on)}>
          {#if rows.on}
            {#each shown.slice(rows.range.start, rows.range.end) as entry, at (entry.value)}
              {@render option(entry, rows.range.start + at)}
            {/each}
          {:else if isGrouped(shown)}
            {#each collection.group() as [group, members] (group)}
              <div {...api.getItemGroupProps({ id: slug(group) })}>
                <div {...api.getItemGroupLabelProps({ htmlFor: slug(group) })}>
                  {group}
                </div>
                {#each members as entry, at (entry.value)}
                  {@render option(entry, at)}
                {/each}
              </div>
            {/each}
          {:else}
            {#each shown as entry, at (entry.value)}
              {@render option(entry, at)}
            {/each}
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

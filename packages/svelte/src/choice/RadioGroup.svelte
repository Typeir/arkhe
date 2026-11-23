<!--
@component
Renders a radio group on native radios in a fieldset: rhombus pips or joined
segments, the legend naming the group, then a hint or an error. Tab reaches
the chosen radio, arrows move the choice, all natively; `value` binds; a new
error is announced politely.
-->
<script module lang="ts">
  import type {
    CheckboxSize,
    RadioItem,
    RadioLook,
    RadioOrientation,
  } from '@arkhe/core';

  /**
   * Props of RadioGroup.
   *
   * @interface RadioGroupProps
   * @property {string} label - Legend; names the group.
   * @property {readonly RadioItem[]} items - Choices, in order; a repeated value is dropped.
   * @property {string | null} [value] - Chosen value; bindable, null chooses none.
   * @property {string} [defaultValue] - First choice when uncontrolled.
   * @property {(value: string) => void} [onValueChange] - Reports a new choice.
   * @property {RadioLook} [look] - Pips or segments. Defaults to `pip`.
   * @property {CheckboxSize} [size] - Pip size. Defaults to `m`.
   * @property {RadioOrientation} [orientation] - Direction. Defaults to `horizontal`.
   * @property {boolean} [labelHidden] - Hides the legend visually.
   * @property {string} [name] - Form field name; generated when absent.
   * @property {boolean} [required] - A choice is needed to submit.
   * @property {boolean} [disabled] - Blocks every choice.
   * @property {string} [hint] - Help text.
   * @property {string} [error] - Error text; replaces the hint.
   */
  export interface RadioGroupProps {
    label: string;
    items: readonly RadioItem[];
    value?: string | null;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    look?: RadioLook;
    size?: CheckboxSize;
    orientation?: RadioOrientation;
    labelHidden?: boolean;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
    error?: string;
  }
</script>

<script lang="ts">
  import {
    ARKHE_CLASS,
    fieldDescribedBy,
    fieldIds,
    hasText,
    partAttrs,
    radioRootAttrs,
    uniqueByValue,
  } from '@arkhe/core';
  import { untrack } from 'svelte';
  import FieldNote from '../field/FieldNote.svelte';

  let {
    label,
    items,
    value = $bindable(),
    defaultValue,
    onValueChange,
    look,
    size,
    orientation,
    labelHidden,
    name,
    required,
    disabled,
    hint,
    error,
  }: RadioGroupProps = $props();
  const id = $props.id();
  const ids = fieldIds(id);
  const initial = untrack(() => defaultValue ?? null);
  const chosen = $derived(value === undefined ? initial : value);
  const shown = $derived(uniqueByValue(items));
  const commit = (next: string) => {
    value = next;
    onValueChange?.(next);
  };
  const restore = (root: HTMLFieldSetElement) => {
    const form = root.form;
    if (!form) return undefined;
    const reset = () => {
      queueMicrotask(() => (value = initial));
    };
    form.addEventListener('reset', reset);
    return () => {
      form.removeEventListener('reset', reset);
    };
  };
</script>

<fieldset
  class={ARKHE_CLASS}
  {...partAttrs('radio-group', 'root')}
  {...radioRootAttrs({
    look,
    size,
    orientation,
    invalid: Boolean(error),
    labelHidden,
  })}
  id={ids.control}
  role="radiogroup"
  {disabled}
  aria-describedby={fieldDescribedBy(ids, hint, error)}
  aria-invalid={hasText(error) ? true : undefined}
  aria-required={required}
  {@attach restore}>
  <legend {...partAttrs('radio-group', 'legend')} id={ids.label}
    >{label}</legend>
  <div {...partAttrs('radio-group', 'items')}>
    {#each shown as item (item.value)}
      <label {...partAttrs('radio-group', 'item')} data-value={item.value}>
        <input
          {...partAttrs('radio-group', 'input')}
          type="radio"
          name={name ?? ids.control}
          value={item.value}
          checked={chosen === item.value}
          defaultChecked={initial === item.value}
          onchange={() => {
            commit(item.value);
          }}
          {required}
          disabled={item.disabled} />
        <span {...partAttrs('radio-group', 'label')}>{item.label}</span>
      </label>
    {/each}
  </div>
  <FieldNote {ids} {hint} {error} />
</fieldset>

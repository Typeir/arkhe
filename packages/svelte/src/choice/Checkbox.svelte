<!--
@component
Renders a checkbox on a native input: a rhombus pip or a square box, a label
beside it, then a hint or an error. Space toggles it; a `<fieldset disabled>`
around it disables it; `checked` binds; a new error is announced politely.
-->
<script module lang="ts">
  import type { CheckboxLook, CheckboxSize } from '@arkhe/core';

  /**
   * Props of Checkbox.
   *
   * @interface CheckboxProps
   * @property {string} label - Visible label; names the box.
   * @property {boolean} [checked] - Checked state; bindable.
   * @property {boolean} [defaultChecked] - First state when uncontrolled.
   * @property {(checked: boolean) => void} [onCheckedChange] - Reports changes.
   * @property {boolean} [indeterminate] - Mixed state.
   * @property {CheckboxLook} [look] - Pip or box. Defaults to `pip`.
   * @property {CheckboxSize} [size] - s, m or l. Defaults to `m`.
   * @property {boolean} [labelHidden] - Hides the label visually.
   * @property {string} [name] - Form field name.
   * @property {string} [value] - Value submitted while checked.
   * @property {boolean} [required] - Must be checked to submit.
   * @property {boolean} [disabled] - Blocks changes.
   * @property {string} [hint] - Help text.
   * @property {string} [error] - Error text; replaces the hint.
   */
  export interface CheckboxProps {
    label: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    indeterminate?: boolean;
    look?: CheckboxLook;
    size?: CheckboxSize;
    labelHidden?: boolean;
    name?: string;
    value?: string;
    required?: boolean;
    disabled?: boolean;
    hint?: string;
    error?: string;
  }
</script>

<script lang="ts">
  import {
    ARKHE_CLASS,
    checkboxRootAttrs,
    fieldDescribedBy,
    fieldIds,
    hasText,
    markIndeterminate,
    partAttrs,
  } from '@arkhe/core';
  import { untrack } from 'svelte';
  import Icon from '../base/Icon.svelte';
  import FieldNote from '../field/FieldNote.svelte';

  let {
    label,
    checked = $bindable(),
    defaultChecked,
    onCheckedChange,
    indeterminate,
    look,
    size,
    labelHidden,
    name,
    value,
    required,
    disabled,
    hint,
    error,
  }: CheckboxProps = $props();
  const id = $props.id();
  const ids = fieldIds(id);
  const initial = untrack(() => defaultChecked ?? false);
</script>

<div
  class={ARKHE_CLASS}
  {...partAttrs('checkbox', 'root')}
  {...checkboxRootAttrs({
    look,
    size,
    invalid: Boolean(error),
    labelHidden,
  })}>
  <label {...partAttrs('checkbox', 'control')}>
    <span {...partAttrs('checkbox', 'box')}>
      <input
        {@attach (node) => {
          markIndeterminate(node, indeterminate);
        }}
        {...partAttrs('checkbox', 'input')}
        type="checkbox"
        id={ids.control}
        bind:checked={() => checked ?? initial, (next) => (checked = next)}
        onchange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        {name}
        {value}
        {required}
        {disabled}
        aria-describedby={fieldDescribedBy(ids, hint, error)}
        aria-invalid={hasText(error) ? true : undefined} />
      {#if look === 'box'}
        <span {...partAttrs('checkbox', 'mark')} aria-hidden="true">
          <Icon name="check" />
          <Icon name="minus" />
        </span>
      {/if}
    </span>
    <span {...partAttrs('checkbox', 'label')}>{label}</span>
  </label>
  <FieldNote {ids} {hint} {error} />
</div>

<!--
@component
Renders how Select, Picker and Search look at phone width: a button shows the
choice and opens a sheet from the bottom edge, titled by the label, holding
the search box and the list, so the on-screen keyboard never covers them.
The sheet focuses its search box. Not exported.
-->
<script module lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Props of SheetField.
   *
   * @interface SheetFieldProps
   * @property {string} label - Visible label; titles the sheet.
   * @property {string} [text] - The current choice, shown on the button.
   * @property {string} [placeholder] - Shown on the button without a choice.
   * @property {'s' | 'm' | 'l'} [size] - Control size. Defaults to `m`.
   * @property {boolean} [labelHidden] - Keeps the label for assistive tech only.
   * @property {boolean} [disabled] - Blocks opening.
   * @property {string} [name] - Form field name, carried by a stand-in input.
   * @property {string | null} [value] - Value the stand-in input submits.
   * @property {boolean} [required] - A value must be chosen; a stand-in input takes part in form validation.
   * @property {string} [hint] - Help text under the button.
   * @property {string} [error] - Error text; replaces the hint and marks the button invalid.
   * @property {Snippet<[() => void]>} children - Sheet body; its argument shuts the sheet.
   */
  export interface SheetFieldProps {
    label: string;
    text?: string;
    placeholder?: string;
    size?: 's' | 'm' | 'l';
    labelHidden?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string | null;
    required?: boolean;
    hint?: string;
    error?: string;
    children: Snippet<[() => void]>;
  }
</script>

<script lang="ts">
  import {
    ARKHE_CLASS,
    fieldDescribedBy,
    fieldIds,
    flag,
    hasText,
    partAttrs,
  } from '@arkhe/core';
  import Icon from '../base/Icon.svelte';
  import FieldNote from '../field/FieldNote.svelte';
  import Modal from '../overlay/Modal.svelte';

  let {
    label,
    text,
    placeholder,
    size,
    labelHidden,
    disabled,
    name,
    value,
    required,
    hint,
    error,
    children,
  }: SheetFieldProps = $props();
  const id = $props.id();
  const ids = fieldIds(id);
  let trigger = $state<HTMLButtonElement | null>(null);
  let open = $state(false);
  let body = $state<HTMLDivElement | null>(null);
  const close = () => (open = false);
</script>

<div
  class={ARKHE_CLASS}
  {...partAttrs('select', 'root')}
  data-size={size}
  data-label-hidden={flag(labelHidden)}>
  <span {...partAttrs('select', 'label')} id={`${id}label`}>{label}</span>
  <div {...partAttrs('select', 'control')} data-invalid={flag(Boolean(error))}>
    <button
      bind:this={trigger}
      type="button"
      {...partAttrs('select', 'trigger')}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-labelledby={`${id}label ${id}text`}
      aria-describedby={fieldDescribedBy(ids, hint, error)}
      data-placeholder-shown={flag(!hasText(text))}
      {disabled}
      onclick={() => (open = true)}
      ><span {...partAttrs('select', 'value-text')} id={`${id}text`}
        >{hasText(text) ? text : (placeholder ?? '')}</span
      ><span {...partAttrs('select', 'indicator')}
        ><Icon name="chevron-down" /></span
      ></button>
  </div>
  <FieldNote {ids} {hint} {error} />
  {#if name !== undefined || required}
    <input
      {...partAttrs('select', 'stand-in')}
      {name}
      value={value ?? ''}
      {required}
      autocomplete="off"
      tabindex={-1}
      aria-hidden="true"
      onfocus={() => trigger?.focus()} />
  {/if}
  <Modal
    title={label}
    bind:open
    sheet
    initialFocus={() => body?.querySelector('input') ?? null}>
    <div bind:this={body}>{@render children(close)}</div>
  </Modal>
</div>

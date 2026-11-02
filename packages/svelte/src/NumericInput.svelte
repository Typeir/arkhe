<!--
@component
Renders a number field on Zag's number-input machine. Outside it is a number
or `null`. `value` always binds, even from undefined; `onValueChange` only
reports. A host that rejects or clamps a change uses a function binding, and
the field snaps back to what the getter returns on blur. A controlled value
set while typing waits until blur, so a parent that clamps cannot eat
keystrokes. The port keeps its own draft text: Zag hands the
input its formatted value, which Svelte would bind live and so erase a lone
"-".
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    SVELTE_EVENTS,
    formatDraft,
    guardInputProps,
    numericMachineProps,
    type NumericValue,
  } from '@arkhe/core';
  import * as numberInput from '@zag-js/number-input';
  import { mergeProps, normalizeProps, useMachine } from '@zag-js/svelte';
  import { untrack } from 'svelte';
  import { useArkhe } from './context.js';
  import { useArkheEnvironment } from './environment.js';
  import Icon from './Icon.svelte';
  import { useNumericSync } from './numericSync.svelte.js';

  /**
   * Props of NumericInput.
   *
   * @interface Props
   * @property {string} label - Visible label; also names the step buttons.
   * @property {NumericValue} [value] - Value; bindable. A function binding vetoes or clamps.
   * @property {NumericValue} [defaultValue] - First value when uncontrolled.
   * @property {(value: NumericValue) => void} [onValueChange] - Reports every draft change.
   * @property {(value: NumericValue) => void} [onValueCommit] - Blur or Enter, clamped.
   * @property {number} [min] - Lowest value.
   * @property {number} [max] - Highest value.
   * @property {number} [step] - Step size. Defaults to 1.
   */
  interface Props {
    label: string;
    value?: NumericValue;
    defaultValue?: NumericValue;
    onValueChange?: (value: NumericValue) => void;
    onValueCommit?: (value: NumericValue) => void;
    min?: number;
    max?: number;
    step?: number;
  }

  let {
    label,
    value = $bindable(),
    defaultValue,
    onValueChange,
    onValueCommit,
    min,
    max,
    step,
  }: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const sync = useNumericSync(
    () => value,
    () => api,
  );
  let draft = $state(
    untrack(() => formatDraft(value !== undefined ? value : defaultValue)),
  );

  const emit = (next: NumericValue) => {
    value = next;
    onValueChange?.(next);
  };

  const service = useMachine(numberInput.machine, () => ({
    ...numericMachineProps({
      id,
      label,
      labels: arkhe().labels,
      value,
      defaultValue,
      min,
      max,
      step,
      getRootNode: env().getRootNode,
    }),
    onValueChange: (details: numberInput.ValueChangeDetails) => {
      draft = details.value;
      sync.emit(details.valueAsNumber, emit);
    },
    onValueCommit: (details: numberInput.ValueChangeDetails) =>
      sync.commit(details.valueAsNumber, onValueCommit, { min, max }),
  }));
  const api = $derived(numberInput.connect(service, normalizeProps));
  const inputProps = $derived(
    guardInputProps(
      { ...api.getInputProps(), value: draft },
      { min, max },
      sync,
      SVELTE_EVENTS,
    ),
  );
</script>

<div {...mergeProps(api.getRootProps(), { class: ARKHE_CLASS })}>
  <label {...api.getLabelProps()}>{label}</label>
  <div {...api.getControlProps()}>
    <button {...api.getDecrementTriggerProps()}><Icon name="minus" /></button>
    <input {...inputProps} />
    <button {...api.getIncrementTriggerProps()}><Icon name="plus" /></button>
  </div>
</div>

<!--
@component
Renders a number field on Zag's number-input machine. Outside it is a number
or `null`. Without `onValueChange`, `value` binds, even from undefined. With
it, the host owns `value` as in React: the field never writes it, so a host
that rejects or clamps a change sees the field snap back on blur. A
controlled value set while typing waits until blur, so a parent that clamps
cannot eat keystrokes. The port keeps its own draft text: Zag hands the
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
   * @property {NumericValue} [value] - Controlled value; bindable when `onValueChange` is absent.
   * @property {NumericValue} [defaultValue] - First value when uncontrolled.
   * @property {(value: NumericValue) => void} [onValueChange] - Every draft change.
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
    if (onValueChange) onValueChange(next);
    else value = next;
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

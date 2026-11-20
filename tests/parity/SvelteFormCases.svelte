<!--
@component
Svelte side of the form control parity scenes. Each must match its twin in
`ReactFormCases.tsx`.
-->
<script lang="ts">
  import { Checkbox, RadioGroup, ToggleGroup } from '@arkhe/svelte';
  import { ASPECT_ITEMS, UNIT_ITEMS } from './scenes';

  /**
   * Props of SvelteFormCases.
   *
   * @interface Props
   * @property {string} name - Scene name.
   */
  interface Props {
    name: string;
  }

  let { name }: Props = $props();
</script>

{#if name === 'checkbox'}
  <Checkbox label="Use GPU" />
  <Checkbox label="Clamp" look="box" size="s" defaultChecked />
  <Checkbox label="All" size="l" indeterminate hint="Some chosen." />
  <Checkbox label="Slain" name="slain" value="yes" error="Required." />
  <Checkbox label="Proficient" labelHidden disabled />
{:else if name === 'radio-group'}
  <RadioGroup label="Units" items={UNIT_ITEMS} defaultValue="metric" />
  <RadioGroup
    label="Shape"
    items={UNIT_ITEMS}
    look="segmented"
    name="shape"
    hint="Halftone dots." />
  <RadioGroup
    label="Blend"
    items={UNIT_ITEMS}
    orientation="vertical"
    labelHidden
    error="Pick one."
    required />
{:else if name === 'toggle-group'}
  <ToggleGroup
    label="Aspects"
    items={ASPECT_ITEMS}
    multiple
    clearable
    limit={2}
    defaultValue={['storm']} />
  <ToggleGroup
    label="Focus"
    items={UNIT_ITEMS}
    orientation="vertical"
    deselectable />
{:else}
  missing scene {name}
{/if}

<!--
@component
Svelte specimen section for choice controls: checkboxes as pips and boxes in
every size, a select-all box that reads mixed, one with a hint; radio groups
as segments and as pips in two sizes; toggle groups with a limit and clear,
and a vertical single-press one.
-->
<script lang="ts">
  import { Checkbox, RadioGroup, ToggleGroup } from '@arkhe/svelte';
  import {
    SPECIMEN_ASPECTS,
    SPECIMEN_BOONS,
    SPECIMEN_SECTIONS,
    SPECIMEN_TOOLS,
    SPECIMEN_UNITS,
  } from '../specimen';

  const SIZES = ['s', 'm', 'l'] as const;
  const SPELLS = ['Frost', 'Ember'];
  let picked = $state([true, false]);
  let units = $state<string | null>('metric');
  let aspects = $state<readonly string[]>(['tide']);
  const all = $derived(picked.every(Boolean));
  const some = $derived(picked.some(Boolean));
</script>

<section class="specimen" id="choices">
  <h2>{SPECIMEN_SECTIONS.choices}</h2>
  <div class="row">
    {#each SIZES as size (size)}
      <Checkbox label={`Pip ${size}`} {size} />
    {/each}
    {#each SIZES as size (size)}
      <Checkbox label={`Box ${size}`} look="box" {size} defaultChecked />
    {/each}
  </div>
  <div class="row">
    <Checkbox
      label="All spells"
      look="box"
      checked={all}
      indeterminate={some && !all}
      onCheckedChange={(next) => (picked = picked.map(() => next))} />
    {#each SPELLS as label, index (label)}
      <Checkbox {label} look="box" bind:checked={picked[index]} />
    {/each}
    <Checkbox label="Oath sworn" required hint="Needed before the rite." />
    <Checkbox label="Disabled" disabled defaultChecked />
  </div>
  <div class="row">
    <RadioGroup
      label="Units"
      items={SPECIMEN_UNITS}
      look="segmented"
      bind:value={units} />
    <RadioGroup
      label="Boon"
      items={SPECIMEN_BOONS}
      size="l"
      defaultValue="grace"
      hint="One per level." />
    <RadioGroup
      label="Focus"
      items={SPECIMEN_BOONS}
      size="s"
      orientation="vertical"
      required />
    <p>Units: {units}</p>
  </div>
  <div class="row">
    <ToggleGroup
      label="Aspects"
      items={SPECIMEN_ASPECTS}
      multiple
      clearable
      limit={4}
      bind:value={aspects} />
    <ToggleGroup
      label="Tools"
      items={SPECIMEN_TOOLS}
      orientation="vertical"
      deselectable
      defaultValue={['move']} />
    <p>Aspects: {aspects.join(', ') || 'none'}</p>
  </div>
</section>

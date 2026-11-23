<!--
@component
Svelte specimen section for sections that open: a collapsible with a heading
and a lock that disables its controls, one nested in another, a lazy one
hiding a phrase find-in-page can reach, one that grows while open, two
disclosures in a single-open group, and accordions.
-->
<script lang="ts">
  import {
    Accordion,
    Button,
    Checkbox,
    Collapsible,
    Disclosure,
  } from '@arkhe/svelte';
  import {
    SPECIMEN_ACCORDION,
    SPECIMEN_ACCORDION_TEXT,
    SPECIMEN_SECTIONS,
  } from '../specimen';

  let lines = $state(1);
  let locked = $state(false);
</script>

{#snippet text(value: string)}{SPECIMEN_ACCORDION_TEXT[value]}{/snippet}

<section class="specimen" id="sections">
  <h2>{SPECIMEN_SECTIONS.sections}</h2>
  <div class="stack">
    <Collapsible title="Layer" heading={3} defaultOpen>
      {#snippet actions()}
        <Button pressed={locked} onclick={() => (locked = !locked)}
          >Lock</Button>
      {/snippet}
      <fieldset class="bare" disabled={locked}>
        <p>Halftone dots over the base image.</p>
        <Checkbox label="Dither" defaultChecked />
      </fieldset>
      <Collapsible title="Inner">
        <p>Dots per inch, angle and ink.</p>
      </Collapsible>
    </Collapsible>
    <Collapsible title="Growing" defaultOpen>
      <Button onclick={() => (lines += 1)}>Grow</Button>
      {#each { length: lines }, line (line)}
        <p>Line {line + 1}</p>
      {/each}
    </Collapsible>
    <Collapsible title="Hidden lore" lazy>
      <p>Silent bells over the marsh.</p>
    </Collapsible>
    <Collapsible title="Sealed lore">
      <p>Lanterns under the ice.</p>
    </Collapsible>
  </div>
  <div class="stack">
    <Disclosure summary="Palette in 3D" name="views" defaultOpen>
      <p>A cube of every colour.</p>
    </Disclosure>
    <Disclosure summary="LUT colours in 3D" name="views">
      <p>A lattice of mapped colours.</p>
    </Disclosure>
  </div>
  <div class="stack">
    <Accordion items={SPECIMEN_ACCORDION} panel={text} expandAll />
    <Accordion
      items={SPECIMEN_ACCORDION}
      panel={text}
      multiple={false}
      collapsible={false}
      heading={4}
      defaultValue={['senses']} />
  </div>
</section>

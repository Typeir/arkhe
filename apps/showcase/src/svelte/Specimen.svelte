<!--
@component
Svelte specimen: every Arkhé component with the shared specimen data.
-->
<script lang="ts">
  import {
    Button,
    Chip,
    Field,
    HoverCard,
    Icon,
    Menu,
    Modal,
    NumericInput,
    Popover,
    Progress,
    Status,
    Tabs,
    TextArea,
    TextInput,
    Tooltip,
    type NumericValue,
  } from '@arkhe/svelte';
  import {
    SPECIMEN_CHIPS,
    SPECIMEN_ICONS,
    SPECIMEN_MENU,
    SPECIMEN_PROGRESS,
    SPECIMEN_SECTIONS,
    SPECIMEN_TABS,
    SPECIMEN_TAB_TEXT,
    SPECIMEN_TONES,
    clampTen,
    loadSpecimenCard,
    nameReadout,
  } from '../specimen';
  import ComboboxSection from './ComboboxSection.svelte';
  import SkeletonSection from './SkeletonSection.svelte';

  let pressed = $state(false);
  let name = $state('Rhomus');
  let chips = $state<readonly string[]>(SPECIMEN_CHIPS);
  let value = $state<number>(SPECIMEN_PROGRESS.start);
  let clamped = $state<NumericValue>(5);
  let picked = $state('nothing yet');
  const remove = (chip: string) => {
    chips = chips.filter((other) => other !== chip);
  };
</script>

<main>
  <section class="specimen" id="buttons">
    <h2>{SPECIMEN_SECTIONS.buttons}</h2>
    <div class="row">
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button icon="plus">New</Button>
      <Button icon="x" label="Close" />
      <Button icon="plus" label="Add" shape="rhombus" />
      <Button icon="x" label="Remove" shape="rhombus" variant="danger" />
      <Button {pressed} onclick={() => (pressed = !pressed)}>Toggle</Button>
      <Button disabled>Disabled</Button>
      <Button href="#buttons">Link</Button>
    </div>
  </section>

  <section class="specimen" id="fields">
    <h2>{SPECIMEN_SECTIONS.fields}</h2>
    <div class="row">
      <Field
        label="Name"
        readout={nameReadout(name)}
        hint="Shown on the sheet.">
        {#snippet children(control)}
          <TextInput {...control} bind:value={name} maxlength={24} />
        {/snippet}
      </Field>
      <Field label="Bloodline" error="Pick a bloodline first.">
        {#snippet children(control)}
          <TextInput {...control} placeholder="Homunculus" />
        {/snippet}
      </Field>
      <Field label="Notes">
        {#snippet children(control)}
          <TextArea {...control} placeholder="Placeholder text." />
        {/snippet}
      </Field>
    </div>
  </section>

  <section class="specimen" id="numeric">
    <h2>{SPECIMEN_SECTIONS.numeric}</h2>
    <div class="row">
      <NumericInput label="Speed" defaultValue={30} min={0} step={5} />
      <NumericInput
        label="Clamped 0 to 10"
        bind:value={() => clamped, (next) => (clamped = clampTen(next))}
        min={0}
        max={10} />
      <NumericInput label="Unbounded" defaultValue={null} />
    </div>
  </section>

  <section class="specimen" id="chips">
    <h2>{SPECIMEN_SECTIONS.chips}</h2>
    <div class="row">
      {#each SPECIMEN_TONES as tone (tone)}<Chip label={tone} {tone} />{/each}
      <Chip label="with icon" icon="check" tone="accent" />
      {#each chips as chip (chip)}<Chip
          label={chip}
          onRemove={() => remove(chip)} />{/each}
    </div>
  </section>

  <section class="specimen" id="icons">
    <h2>{SPECIMEN_SECTIONS.icons}</h2>
    <div class="row">
      {#each SPECIMEN_ICONS as icon (icon)}
        <span class="icon-cell"><Icon name={icon} /><code>{icon}</code></span>
      {/each}
    </div>
  </section>

  <section class="specimen" id="progress">
    <h2>{SPECIMEN_SECTIONS.progress}</h2>
    <div class="row">
      <div class="stack">
        <Progress
          {value}
          max={SPECIMEN_PROGRESS.max}
          markers={SPECIMEN_PROGRESS.markers}
          label="Budget"
          showValue />
        <div class="row">
          <Button icon="minus" label="Less" onclick={() => (value -= 1)} />
          <Button icon="plus" label="More" onclick={() => (value += 1)} />
        </div>
      </div>
    </div>
  </section>

  <SkeletonSection />

  <section class="specimen" id="status">
    <h2>{SPECIMEN_SECTIONS.status}</h2>
    <div class="row">
      <div class="stack">
        <Status kind="empty" />
        <Status kind="loading" />
        <Status kind="error" />
        <Status kind="info">Placeholder information.</Status>
      </div>
    </div>
  </section>

  <section class="specimen" id="tabs">
    <h2>{SPECIMEN_SECTIONS.tabs}</h2>
    <div class="row">
      <Tabs items={SPECIMEN_TABS} label="Sheet">
        {#snippet panel(key)}{SPECIMEN_TAB_TEXT[key]}{/snippet}
      </Tabs>
    </div>
  </section>

  <section class="specimen" id="modal">
    <h2>{SPECIMEN_SECTIONS.modal}</h2>
    <div class="row">
      <Modal
        title="Short rest"
        description="Spend recovery dice."
        trigger="Open modal">
        <NumericInput label="Dice" defaultValue={1} min={0} max={4} />
      </Modal>
      <Modal
        title="Discard changes?"
        role="alertdialog"
        trigger="Open confirmation">
        <p>Unsaved edits are lost.</p>
      </Modal>
    </div>
  </section>

  <section class="specimen" id="floating">
    <h2>{SPECIMEN_SECTIONS.floating}</h2>
    <div class="row">
      <p class="prose">
        Hover <Tooltip content="Halves incoming damage.">resistance</Tooltip>,
        read the
        <HoverCard title="Charge">
          charge
          {#snippet content()}
            <span
              >Spend one to take a second
              <HoverCard title="Action"
                >action{#snippet content()}One per turn, before moving.{/snippet}</HoverCard
              >.</span>
          {/snippet}
        </HoverCard>
        card, or open
        <HoverCard title="Fireball" load={loadSpecimenCard}>
          fireball
          {#snippet loaded(text)}<span>{text}</span>{/snippet}
        </HoverCard>, which loads on first open.
      </p>
      <Popover trigger="Filters" title="Filter by">
        <NumericInput label="Level" defaultValue={1} min={1} max={20} />
      </Popover>
      <Menu
        trigger="Actions"
        items={SPECIMEN_MENU}
        onSelect={(value) => (picked = value)} />
      <output>Picked: {picked}</output>
    </div>
  </section>

  <ComboboxSection />
</main>

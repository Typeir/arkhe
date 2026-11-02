<!--
@component
Svelte side of the parity scenes. Each scene must match its twin in
`ReactCases.tsx` element for element.
-->
<script lang="ts">
  import {
    Button,
    Chip,
    Combobox,
    Field,
    HoverCard,
    Icon,
    Menu,
    Modal,
    NumericInput,
    Popover,
    Progress,
    Skeleton,
    SkeletonGroup,
    Status,
    Tabs,
    TextArea,
    TextInput,
    Tooltip,
  } from '@arkhe/svelte';
  import type { NumericValue } from '@arkhe/core';
  import {
    COMBO_ITEMS,
    MENU_ITEMS,
    TAB_ITEMS,
    TAB_TEXT,
    TWIN_OPTIONS,
    TWIN_TABS,
  } from './scenes';

  /**
   * Props of SvelteCases.
   *
   * @interface Props
   * @property {string} name - Scene name.
   */
  interface Props {
    name: string;
  }

  let { name }: Props = $props();
  let pressed = $state(false);
  let speed = $state<NumericValue>(5);
  let speedLog = $state<NumericValue[]>([]);
  const answerSpeed = (next: NumericValue) => {
    speedLog.push(next);
    speed = next === null ? null : Math.min(next, 10);
  };
</script>

{#if name === 'buttons'}
  <Button>Default</Button>
  <Button variant="primary">Primary</Button>
  <Button variant="ghost" icon="plus">New</Button>
  <Button variant="danger" disabled>Danger</Button>
  <Button icon="x" label="Close" />
  <Button icon="plus" label="Add" shape="rhombus" />
  <Button {pressed} onclick={() => (pressed = !pressed)}>Toggle</Button>
  <Button href="#a">Link</Button>
  <Button href="#b" disabled>Dead link</Button>
{:else if name === 'chips'}
  <Chip label="neutral" />
  <Chip label="accent" tone="accent" icon="check" />
  <Chip label="charge" onRemove={() => undefined} />
{:else if name === 'fields'}
  <Field label="Name" readout="6 / 24" hint="Shown on the sheet.">
    {#snippet children(control)}<TextInput
        {...control}
        value="Rhomus" />{/snippet}
  </Field>
  <Field label="Bloodline" error="Pick one.">
    {#snippet children(control)}<TextInput
        {...control}
        placeholder="Homunculus" />{/snippet}
  </Field>
  <Field label="Notes">
    {#snippet children(control)}<TextArea {...control} rows={3} />{/snippet}
  </Field>
{:else if name === 'icons'}
  <Icon name="check" />
  <Icon name="info" label="Details" />
  <Icon name="not-an-icon" />
{:else if name === 'progress'}
  <Progress value={5} max={10} label="Budget" markers={[2, 8]} showValue />
  <Progress value={13} max={10} label="Load" />
{:else if name === 'skeleton'}
  <SkeletonGroup>
    <Skeleton width="40%" />
    <Skeleton shape="block" height="3rem" />
  </SkeletonGroup>
{:else if name === 'status'}
  <Status kind="empty" />
  <Status kind="loading" />
  <Status kind="error" />
  <Status kind="info">Two rolls left.</Status>
{:else if name === 'numeric'}
  <NumericInput label="Speed" defaultValue={3} min={0} max={10} />
{:else if name === 'numeric-controlled'}
  <NumericInput label="Speed" value={speed} onValueChange={answerSpeed} />
  <Button onclick={() => (speed = 8)}>Set 8</Button>
  <output>{speedLog.join(' ')}</output>
{:else if name === 'tabs'}
  <Tabs items={TAB_ITEMS} label="Sheet">
    {#snippet panel(key)}{TAB_TEXT[key]}{/snippet}
  </Tabs>
{:else if name === 'duplicates'}
  <Progress value={5} max={10} label="Budget" markers={[2, 2]} />
  <Tabs items={TWIN_TABS} label="Sheet">
    {#snippet panel(key)}{TAB_TEXT[key]}{/snippet}
  </Tabs>
  <Combobox label="Spell" items={TWIN_OPTIONS} />
{:else if name === 'modal'}
  <Modal title="Rest" description="Recover." trigger="Open">Body</Modal>
{:else if name === 'tooltip'}
  <Tooltip content="Halves damage." openDelay={0} closeDelay={0}
    >resistance</Tooltip>
{:else if name === 'hover-card'}
  <HoverCard title="Charge" openDelay={0}>
    charge
    {#snippet content()}Spend to act twice.{/snippet}
  </HoverCard>
{:else if name === 'popover'}
  <Popover trigger="Filters" title="Filter by">Body</Popover>
{:else if name === 'menu'}
  <Menu trigger="Actions" items={MENU_ITEMS} onSelect={() => undefined} />
{:else if name === 'combobox'}
  <Combobox label="Spell" items={COMBO_ITEMS} />
{:else}
  missing scene {name}
{/if}

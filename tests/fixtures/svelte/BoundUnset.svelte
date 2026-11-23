<!--
@component
Test fixture: a parent that binds one native-state component's `checked`,
`value` or `open` to a state that starts undefined, passes the matching
default, and shows what the binding holds.
-->
<script lang="ts">
  import {
    Accordion,
    Checkbox,
    Collapsible,
    RadioGroup,
    ToggleGroup,
  } from '@arkhe/svelte';
  import { createRawSnippet } from 'svelte';

  /**
   * Props of BoundUnset.
   *
   * @interface Props
   * @property {'checkbox' | 'radio' | 'toggle' | 'accordion' | 'collapsible'} kind - Component under test.
   */
  interface Props {
    kind: 'checkbox' | 'radio' | 'toggle' | 'accordion' | 'collapsible';
  }

  let { kind }: Props = $props();
  let checked = $state<boolean>();
  let choice = $state<string | null>();
  let values = $state<readonly string[]>();
  let open = $state<boolean>();
  const items = [
    { value: 'str', label: 'Strength', title: 'Strength' },
    { value: 'dex', label: 'Dexterity', title: 'Dexterity' },
  ];
  const panel = createRawSnippet<[string]>((value) => ({
    render: () => `<span>panel ${value()}</span>`,
  }));
  const body = createRawSnippet(() => ({ render: () => '<span>Body</span>' }));
  const held = $derived.by(() => {
    if (kind === 'checkbox') return checked;
    if (kind === 'radio') return choice;
    if (kind === 'collapsible') return open;
    return values;
  });
</script>

{#if kind === 'checkbox'}
  <Checkbox label="Proficient" defaultChecked bind:checked />
{:else if kind === 'radio'}
  <RadioGroup label="Ability" {items} defaultValue="dex" bind:value={choice} />
{:else if kind === 'toggle'}
  <ToggleGroup
    label="Abilities"
    {items}
    multiple
    defaultValue={['dex']}
    bind:value={values} />
{:else if kind === 'accordion'}
  <Accordion {items} {panel} defaultValue={['dex']} bind:value={values} />
{:else}
  <Collapsible title="Notes" defaultOpen bind:open
    >{@render body()}</Collapsible>
{/if}
<pre>held {JSON.stringify(held) ?? 'undefined'}</pre>

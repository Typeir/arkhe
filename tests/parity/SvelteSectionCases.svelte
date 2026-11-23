<!--
@component
Svelte side of the section parity scenes: Collapsible, Disclosure, Accordion,
nested folder Tabs.
Each must match its twin in `ReactSectionCases.tsx`.
-->
<script lang="ts">
  import {
    Accordion,
    Button,
    Collapsible,
    Disclosure,
    Tabs,
  } from '@arkhe/svelte';
  import { SECTION_ITEMS, TAB_ITEMS, TAB_TEXT } from './scenes';

  /**
   * Props of SvelteSectionCases.
   *
   * @interface Props
   * @property {string} name - Scene name.
   */
  interface Props {
    name: string;
  }

  let { name }: Props = $props();
</script>

{#if name === 'collapsible'}
  <Collapsible title="Lore">Old roads.</Collapsible>
  <Collapsible title="Layer" heading={3} defaultOpen>
    {#snippet actions()}<Button>Lock</Button>{/snippet}
    Body
  </Collapsible>
  <Collapsible title="Hidden" lazy>Late</Collapsible>
{:else if name === 'disclosure'}
  <Disclosure summary="Palette" name="views" defaultOpen>Cube</Disclosure>
  <Disclosure summary="LUT" name="views">Grid</Disclosure>
{:else if name === 'tabs-folder'}
  <Tabs look="folder" items={TAB_ITEMS} label="Outer">
    {#snippet panel(value)}
      {#if value === 'stats'}
        <Tabs look="folder" items={TAB_ITEMS} label="Inner">
          {#snippet panel(inner)}{TAB_TEXT[inner]}{/snippet}
        </Tabs>
      {:else}{TAB_TEXT[value]}{/if}
    {/snippet}
  </Tabs>
{:else if name === 'accordion'}
  <Accordion items={SECTION_ITEMS} expandAll defaultValue={['senses']}>
    {#snippet panel(value)}panel {value}{/snippet}
  </Accordion>
{:else}
  missing scene {name}
{/if}

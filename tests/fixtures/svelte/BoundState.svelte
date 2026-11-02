<!--
@component
Test fixture: a parent that binds one stateful component's `value` or `open`
and shows what the binding holds. With `refuse` it binds through a function
binding whose setter ignores every change.
-->
<script lang="ts">
  import { Combobox, Modal, Popover, Tabs } from '@arkhe/svelte';
  import { createRawSnippet } from 'svelte';

  /**
   * Props of BoundState.
   *
   * @interface Props
   * @property {'tabs' | 'modal' | 'popover' | 'combobox'} kind - Component under test.
   * @property {boolean} [refuse] - Vetoes every change through a function binding.
   */
  interface Props {
    kind: 'tabs' | 'modal' | 'popover' | 'combobox';
    refuse?: boolean;
  }

  let { kind, refuse = false }: Props = $props();
  let tab = $state('stats');
  let open = $state(false);
  let pick = $state<string | null>(null);
  const guard =
    <V,>(write: (next: V) => void) =>
    (next: V) => {
      if (!refuse) write(next);
    };
  const setTab = guard<string | undefined>((next) => (tab = next ?? tab));
  const setOpen = guard<boolean | undefined>((next) => (open = next ?? false));
  const setPick = guard<string | null | undefined>(
    (next) => (pick = next ?? null),
  );
  const items = [
    { value: 'stats', label: 'Stats' },
    { value: 'spells', label: 'Spells' },
  ];
  const panel = createRawSnippet<[string]>((value) => ({
    render: () => `<span>panel ${value()}</span>`,
  }));
  const body = createRawSnippet(() => ({ render: () => '<span>Body</span>' }));
</script>

{#if kind === 'tabs'}
  <Tabs {items} label="Sheet" {panel} bind:value={() => tab, setTab} />
{:else if kind === 'modal'}
  <Modal title="Rest" trigger="Rest" bind:open={() => open, setOpen}>
    {@render body()}
  </Modal>
{:else if kind === 'popover'}
  <Popover trigger="Filters" title="Filter by" bind:open={() => open, setOpen}>
    {@render body()}
  </Popover>
{:else}
  <Combobox label="Spell" {items} bind:value={() => pick, setPick} />
{/if}
<pre>held {String(
    kind === 'tabs' ? tab : kind === 'combobox' ? pick : open,
  )}</pre>

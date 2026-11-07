<!--
@component
A keyword linking to its rule, with a card that loads on first open.
-->
<script lang="ts">
  import { HoverCard } from '@arkhe/svelte';
  import { loadShard } from '../data';

  let { term, display }: { term: string; display?: string } = $props();
  const load = $derived(() => loadShard(term));
</script>

<HoverCard
  title={display ?? term}
  href={`/en/library/keywords/${term.replaceAll(' ', '-')}`}
  {load}
  >{display ?? term}{#snippet loaded(text: string)}<div>
      <h3>{display ?? term}</h3>
      <p>{text}</p>
    </div>{/snippet}</HoverCard>

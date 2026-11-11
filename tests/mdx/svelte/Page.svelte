<!--
@component
Svelte twin of the MDX fixtures, as an island would render them: the
lineage page, the creature sheet with the floating controls, and a dense
paragraph of a hundred triggers.
-->
<script lang="ts">
  import {
    ArkheProvider,
    Menu,
    Popover,
    Select,
    Tooltip,
    type LinkComponent,
  } from '@arkhe/svelte';
  import { DENSE_TRIGGERS } from '../fixtures';
  import Keyword from './Keyword.svelte';
  import RouterLink from '../../fixtures/svelte/RouterLink.svelte';
  import Unit from './Unit.svelte';

  let { name }: { name: 'lineage' | 'sheet' | 'dense' } = $props();
  const link = RouterLink as unknown as LinkComponent;
  const reach = Array.from({ length: DENSE_TRIGGERS / 2 }, (_, i) => i);
</script>

<ArkheProvider {link} effects={false}>
  <article>
    {#if name === 'lineage'}
      <h1>Empyrean</h1>
      <p>
        They see in the dark to <Unit value="6" unit="stride" /> and walk <Unit
          value="5"
          unit="stride" /> a turn.
      </p>
      <ul>
        <li>Standard vision</li>
        <li>
          <Tooltip inline
            ><span>Tremorsense <Unit value="6" unit="stride" /></span
            >{#snippet content()}Only while in contact with the same solid
              surface as the target.{/snippet}</Tooltip>
        </li>
      </ul>
      <p>
        A creature that is <Keyword term="charmed" display="Charmed" /> or <Keyword
          term="frightened"
          display="Frightened" /> cannot <Keyword term="dash" /> while within <Unit
          value="1"
          denominator="2"
          unit="league" /> of the source.
      </p>
    {:else if name === 'sheet'}
      <h2>Traits</h2>
      <p>
        The hoarder casts at <Unit value="12" unit="stride" /> and ignores <Keyword
          term="damage bonus"
          display="damage bonuses" />.
      </p>
      <p>
        It wears <Popover trigger="Rings" title="Ring list"
          >Only the rings it carries.</Popover> on every finger.
      </p>
      <Menu
        trigger="Actions"
        items={[
          { value: 'rename', label: 'Rename' },
          { separator: true },
          { value: 'drop', label: 'Drop', danger: true },
        ]}
        onSelect={() => undefined} />
      <Select
        label="Ring"
        items={[
          { value: 'ward', label: 'Ward' },
          { value: 'blink', label: 'Blink' },
        ]} />
    {:else}
      <p>
        {#each reach as index (index)}reach <Unit
            value={String(index + 1)}
            unit="stride" /> then <Keyword term={`term ${index}`} />,
        {/each}
      </p>
    {/if}
  </article>
</ArkheProvider>

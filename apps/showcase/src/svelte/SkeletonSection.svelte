<!--
@component
Svelte skeleton demo: three owners that load and reveal together, plus one
that keeps the CSS skeleton.
-->
<script lang="ts">
  import { Button, Skeleton, SkeletonGroup, useArkhe } from '@arkhe/svelte';
  import {
    SPECIMEN_REVEAL,
    SPECIMEN_REVEAL_ROWS,
    SPECIMEN_SECTIONS,
  } from '../specimen';
  import { exposeEffects } from '../target';

  const arkhe = useArkhe();
  let loading = $state(true);
  let revealed = $state(0);
  $effect(() => exposeEffects(arkhe().effects));
  const count = () => (revealed += 1);
</script>

<section class="specimen" id="skeleton">
  <h2>{SPECIMEN_SECTIONS.skeleton}</h2>
  <div class="row">
    <Button onclick={() => (loading = !loading)}
      >{loading ? 'Load' : 'Reload'}</Button>
    <output>Revealed: {revealed}</output>
    <div class="reveal">
      <div class="reveal-article">
        <SkeletonGroup {loading} onRevealed={count}>
          {#snippet skeleton()}
            <Skeleton width="40%" height="1rem" />
            <Skeleton />
            <Skeleton width="95%" />
            <Skeleton width="60%" />
          {/snippet}
          <h3>{SPECIMEN_REVEAL.title}</h3>
          <p>{SPECIMEN_REVEAL.text}</p>
        </SkeletonGroup>
      </div>
      <div class="reveal-card">
        <SkeletonGroup {loading} onRevealed={count}>
          {#snippet skeleton()}
            <Skeleton width="30%" />
            <Skeleton width="80%" />
            <Skeleton shape="block" />
          {/snippet}
          <h3>{SPECIMEN_REVEAL.card}</h3>
          <p>{SPECIMEN_REVEAL.cardText}</p>
        </SkeletonGroup>
      </div>
      <SkeletonGroup {loading} onRevealed={count}>
        {#snippet skeleton()}
          {#each SPECIMEN_REVEAL_ROWS as [name] (name)}
            <div class="reveal-row">
              <Skeleton width="70%" />
              <Skeleton width="50%" />
              <Skeleton width="40%" />
            </div>
          {/each}
        {/snippet}
        <div class="reveal-list">
          {#each SPECIMEN_REVEAL_ROWS as [name, kind, weight] (name)}
            <div class="reveal-row">
              <span>{name}</span><span>{kind}</span><span>{weight}</span>
            </div>
          {/each}
        </div>
      </SkeletonGroup>
      <SkeletonGroup {loading} effect={false}>
        {#snippet skeleton()}<Skeleton width="50%" />{/snippet}
        <p>Plain CSS skeleton, no canvas.</p>
      </SkeletonGroup>
    </div>
  </div>
</section>

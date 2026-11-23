<!--
@component
Svelte clone of Ikuisuus's keyword cards: a feat line whose `Burning`
keyword opens a card holding two more keywords. Cards portal into the
section's own layer, which carries the look.
-->
<script lang="ts">
  import { ArkheEnvironment } from '@arkhe/svelte';
  import { SPECIMEN_SECTIONS } from '../specimen';
  import IkuisuusKeyword from './IkuisuusKeyword.svelte';

  let layer = $state<HTMLElement>();
</script>

<section class="specimen ikuisuus" id="ikuisuus">
  <h2>{SPECIMEN_SECTIONS.ikuisuus}</h2>
  <ArkheEnvironment container={layer}>
    <p class="prose">
      <strong>Scorching Strike</strong>. The target takes an extra 1d6
      <strong>fire damage</strong>, and saves DEX or is affected by the
      <IkuisuusKeyword term="burning" /> condition.
    </p>
  </ArkheEnvironment>
  <div class="ikuisuus-layer" bind:this={layer}></div>
</section>

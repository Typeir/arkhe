<!--
@component
Svelte target page: the specimen under a provider whose effect setting comes
from the URL.
-->
<script lang="ts">
  import { ArkheProvider } from '@arkhe/svelte';
  import { effectsFromQuery } from '../target';
  import Specimen from './Specimen.svelte';
</script>

<ArkheProvider effects={effectsFromQuery(location.search)}>
  <Specimen />
</ArkheProvider>

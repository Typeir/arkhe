<!--
@component
Test fixture: shows whether `useNarrow` reads phone width.
-->
<script lang="ts">
  import { useNarrow } from '../../../packages/svelte/src/base/narrow.svelte';

  const narrow = useNarrow();
</script>

<output>{narrow.current ? 'narrow' : 'wide'}</output>

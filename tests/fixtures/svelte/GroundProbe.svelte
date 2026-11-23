<!--
@component
Test fixture: shows the tab ground its place in the tree reads.
-->
<script lang="ts">
  import { useTabsGround } from '../../../packages/svelte/src/section/tabsGround';

  const ground = useTabsGround();
</script>

<output>{ground()}</output>

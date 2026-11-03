<!--
@component
Anchor standing in for the app's router link; marks what it renders.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  let { children, ...rest }: HTMLAnchorAttributes & { children?: Snippet } =
    $props();
</script>

<a {...rest} data-router-link="">{@render children?.()}</a>

<!--
@component
Renders a disclosure: a styled native `<details>`, working before hydration
and findable by the browser, which opens, closes and reveals it. Plain
summaries only; a section that needs a heading is a Collapsible.
-->
<script lang="ts">
  import { ARKHE_CLASS, partAttrs } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import Icon from '../base/Icon.svelte';

  /**
   * Props of Disclosure.
   *
   * @interface Props
   * @property {string} summary - Summary text; never a heading.
   * @property {boolean} [defaultOpen] - Starts open.
   * @property {string} [name] - Group name; one disclosure of the group is open at a time.
   * @property {Snippet} children - Content.
   */
  interface Props {
    summary: string;
    defaultOpen?: boolean;
    name?: string;
    children: Snippet;
  }

  let { summary, defaultOpen, name, children }: Props = $props();
</script>

<details
  class={ARKHE_CLASS}
  {...partAttrs('disclosure', 'root')}
  {name}
  open={defaultOpen}>
  <summary {...partAttrs('disclosure', 'summary')}>
    <span {...partAttrs('disclosure', 'marker')}
      ><Icon name="chevron-down" /></span>
    <span {...partAttrs('disclosure', 'title')}>{summary}</span>
  </summary>
  <div {...partAttrs('disclosure', 'body')}>{@render children()}</div>
</details>

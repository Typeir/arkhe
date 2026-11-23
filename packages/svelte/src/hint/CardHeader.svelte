<!--
@component
Renders a hover card's header: the grip that drags the card and opens its move
menu, its small chrome title, the host's actions, then the built-in link, pin
and close buttons. Not exported: HoverCard draws it.
-->
<script module lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Props of CardHeader.
   *
   * @interface CardHeaderProps
   * @property {string} title - Card title; names the buttons.
   * @property {string} titleId - Id of the title, which names the card.
   * @property {string} [href] - Address of the built-in link.
   * @property {Snippet} [actions] - Host controls of the card's chrome.
   * @property {boolean} pinnable - Shows the pin button.
   * @property {boolean} pinned - The card is pinned.
   * @property {() => void} onTogglePin - Pins or unpins.
   * @property {() => void} onClose - Closes a pinned card.
   * @property {boolean} detached - The card is dragged free.
   * @property {(value: string) => void} onMove - A move menu choice: a corner or back.
   */
  export interface CardHeaderProps {
    title: string;
    titleId: string;
    href?: string;
    actions?: Snippet;
    pinnable: boolean;
    pinned: boolean;
    onTogglePin: () => void;
    onClose: () => void;
    detached: boolean;
    onMove: (value: string) => void;
  }
</script>

<script lang="ts">
  import { formatLabel, moveMenu, partAttrs } from '@arkhe/core';
  import Button from '../action/Button.svelte';
  import Menu from '../action/Menu.svelte';
  import { useArkhe } from '../base/context.js';

  let {
    title,
    titleId,
    href,
    actions,
    pinnable,
    pinned,
    onTogglePin,
    onClose,
    detached,
    onMove,
  }: CardHeaderProps = $props();
  const arkhe = useArkhe();
  const pinLabel = $derived(
    formatLabel(pinned ? arkhe().labels.unpin : arkhe().labels.pin, {
      label: title,
    }),
  );
  const linkLabel = $derived(
    formatLabel(arkhe().labels.openLink, { label: title }),
  );
</script>

<div {...partAttrs('hover-card', 'header')}>
  <Menu
    trigger={formatLabel(arkhe().labels.moveCard, { label: title })}
    icon="grip-vertical"
    items={moveMenu(arkhe().labels, detached)}
    onSelect={onMove} />
  <span {...partAttrs('hover-card', 'title')} id={titleId}>{title}</span>
  {#if actions}
    <span {...partAttrs('hover-card', 'actions')}>{@render actions()}</span>
  {/if}
  {#if href !== undefined}
    <Button
      shape="plain"
      size="m"
      icon="external-link"
      label={linkLabel}
      {href} />
  {/if}
  {#if pinnable}
    <Button
      shape="plain"
      size="m"
      icon="pin"
      label={pinLabel}
      pressed={pinned}
      onclick={onTogglePin} />
  {/if}
  <span {...partAttrs('hover-card', 'close')} hidden={!pinned}>
    <Button
      shape="plain"
      tone="danger"
      size="m"
      icon="x"
      label={formatLabel(arkhe().labels.closeCard, { label: title })}
      onclick={onClose} />
  </span>
</div>

<!--
@component
The running half of Tooltip: Zag's tooltip machine, started on the first
hover, focus or tap. Hands its trigger props to the sleeping trigger,
replays the waking event, and renders the body once opened.
-->
<script module lang="ts">
  import type { Sleep } from './sleep.svelte.js';
  import type { TooltipProps } from './Tooltip.svelte';

  /**
   * Props of LiveTooltip.
   *
   * @interface LiveTooltipProps
   * @property {string} id - Machine id.
   * @property {NonNullable<Sleep['waking']>} waking - What woke the machine; replayed once.
   * @property {Sleep} sleeper - The sleeping trigger: report, hover, press and sleep.
   */
  export interface LiveTooltipProps extends Omit<TooltipProps, 'children'> {
    id: string;
    waking: NonNullable<Sleep['waking']>;
    sleeper: Sleep;
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import {
    ARKHE_CLASS,
    floatingMachineProps,
    TOOLTIP_GUTTER,
  } from '@arkhe/core';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import * as tooltip from '@zag-js/tooltip';
  import { onMount, untrack } from 'svelte';
  import { useArkheEnvironment } from '../base/environment.js';
  import { useHint, useHintNode } from './hint.svelte.js';
  import { useSleepAgain } from './sleep.svelte.js';

  let {
    content,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    placement = 'top',
    openDelay = 400,
    closeDelay = 150,
    id,
    waking,
    sleeper,
  }: LiveTooltipProps = $props();
  const env = useArkheEnvironment();
  const node = useHintNode();
  const initial = untrack(() => defaultOpen ?? false);
  const shown = $derived(open ?? initial);
  const commit = (next: boolean) => {
    if (next === shown) return;
    open = next;
    onOpenChange?.(next);
  };
  const service = useMachine(tooltip.machine, () => ({
    ...floatingMachineProps({
      id,
      open: shown,
      onOpenChange: (next: boolean) => {
        if (node.request(next)) commit(next);
      },
      placement,
      gutter: TOOLTIP_GUTTER,
      getRootNode: env().getRootNode,
    }),
    openDelay,
    closeDelay,
    interactive: true,
  }));
  const api = $derived(tooltip.connect(service, normalizeProps));
  const hint = useHint(() => ({
    open: api.open,
    setOpen: commit,
    trigger: api.getTriggerProps() as HTMLAttributes<HTMLElement>,
    positionerId: api.getPositionerProps().id ?? '',
    getRootNode: env().getRootNode,
    node,
    leaving: () => service.state.matches('closing'),
    pressed: sleeper.press,
  }));
  useSleepAgain(() => ({
    closed: shown !== true && !api.open && service.state.matches('closed'),
    idle: () => service.state.matches('closed'),
    opened: hint.mounted,
    pressing: hint.pressing,
    hovering: sleeper.hovering,
    positionerId: api.getPositionerProps().id ?? '',
    sleep: sleeper.sleep,
  }));
  $effect.pre(() => {
    sleeper.report(hint.trigger);
  });
  onMount(() => {
    const el = env()
      .getRootNode()
      .getElementById(api.getTriggerProps().id ?? '');
    if (waking === 'focus' && el?.matches(':focus-visible') === true) {
      service.send({ type: 'open', src: 'trigger.focus' });
    }
    if (waking === 'hover' && sleeper.hovering()) {
      service.send({ type: 'pointer.move' });
    }
  });
</script>

{#if hint.mounted}<div
    class={ARKHE_CLASS}
    use:portal={{
      container: env().container(),
      getRootNode: env().getRootNode,
    }}>
    <div {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
      <div {...api.getContentProps()}>
        <div {...api.getArrowProps()}>
          <div {...api.getArrowTipProps()}></div>
        </div>
        {#if typeof content === 'string'}{content}{:else}{@render content()}{/if}
      </div>
    </div>
  </div>{/if}

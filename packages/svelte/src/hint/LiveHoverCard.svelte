<!--
@component
The running half of HoverCard: Zag's hover-card machine, started on the
first hover, focus or tap. Hands its trigger props to the sleeping trigger,
replays the waking event, and renders the card once opened: pinning,
moving, loading and nested cards all live here.
-->
<script module lang="ts">
  import type { HoverCardProps } from './HoverCard.svelte';
  import type { Sleep } from './sleep.svelte.js';

  /**
   * Props of LiveHoverCard.
   *
   * @interface LiveHoverCardProps
   * @template T
   * @property {string} id - Machine id.
   * @property {NonNullable<Sleep['waking']>} waking - What woke the machine; replayed once.
   * @property {Sleep} sleeper - The sleeping trigger: report, hover, press and sleep.
   */
  export interface LiveHoverCardProps<T> extends Omit<
    HoverCardProps<T>,
    'children'
  > {
    id: string;
    waking: NonNullable<Sleep['waking']>;
    sleeper: Sleep;
  }
</script>

<script lang="ts" generics="T">
  import {
    ARKHE_CLASS,
    CardAccess,
    cardContentProps,
    cardTriggerAria,
    elementById,
    flag,
    floatingMachineProps,
    HINT_GUTTER,
    partAttrs,
    SVELTE_EVENTS,
  } from '@arkhe/core';
  import * as hoverCard from '@zag-js/hover-card';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { onMount, untrack } from 'svelte';
  import { useArkhe } from '../base/context.js';
  import { useArkheEnvironment } from '../base/environment.js';
  import { useContentLoader } from '../feedback/contentLoader.svelte.js';
  import Status from '../feedback/Status.svelte';
  import { useCardDrag } from './cardDrag.svelte.js';
  import CardHeader from './CardHeader.svelte';
  import { useHint, useHintNode } from './hint.svelte.js';
  import HintScope from './HintScope.svelte';
  import { useSleepAgain } from './sleep.svelte.js';

  let {
    title,
    href,
    headerLink = true,
    actions,
    inline,
    content,
    load,
    loaded,
    pinnable = true,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    placement = 'bottom-start',
    openDelay = 400,
    closeDelay = 200,
    width,
    card,
    id,
    waking,
    sleeper,
  }: LiveHoverCardProps<T> = $props();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const node = useHintNode();
  const body = useContentLoader(() => load);
  const initial = untrack(() => defaultOpen ?? false);
  const shown = $derived(open ?? initial);
  let pinned = $state(false);
  let detached = $state(false);
  const commit = (next: boolean) => {
    if (next === shown) return;
    open = next;
    onOpenChange?.(next);
  };
  const service = useMachine(hoverCard.machine, () => ({
    ...floatingMachineProps({
      id,
      open: shown,
      hold: pinned,
      placement,
      gutter: HINT_GUTTER,
      onOpenChange: (next: boolean) => {
        if (node.request(next)) commit(next);
      },
      getRootNode: env().getRootNode,
    }),
    openDelay,
    closeDelay,
    disabled: (card ?? arkhe().hoverCards) !== true,
  }));
  const api = $derived(hoverCard.connect(service, normalizeProps));
  const shownCard = $derived(api.open);
  const triggerId = $derived(api.getTriggerProps().id ?? '');
  const contentId = $derived(api.getContentProps().id ?? '');
  const togglePin = () => {
    if (pinned) commit(service.state.matches('open'));
    pinned = !pinned;
    detached = false;
  };
  const unpinAndClose = () => {
    pinned = false;
    detached = false;
    commit(false);
  };
  $effect(() => {
    if (shown !== true) detached = false;
  });
  $effect(() => {
    if (!shownCard) return undefined;
    const byId = (key: string) => elementById(env().getRootNode(), key);
    const [trigger, content] = [triggerId, contentId];
    const access = new CardAccess({
      getRootNode: env().getRootNode,
      trigger: () => byId(trigger),
      content: () => byId(content),
      node,
      close: () => {
        untrack(() => {
          commit(false);
        });
      },
      release: () => {
        untrack(unpinAndClose);
      },
    });
    access.pin(pinned);
    return access.attach();
  });
  const hint = useHint(() => ({
    open: api.open,
    setOpen: (next: boolean) => {
      if (next || !pinned) commit(next);
    },
    trigger: api.getTriggerProps(),
    positionerId: api.getPositionerProps().id ?? '',
    getRootNode: env().getRootNode,
    node,
    leaving: () => service.state.matches('closing'),
    activate: href === undefined ? togglePin : undefined,
    keys: href === undefined && Boolean(inline),
    pressed: sleeper.press,
  }));
  const cardOpen = $derived(api.open && hint.mounted);
  const move = useCardDrag({
    open: () => cardOpen,
    contentId: () => contentId,
    triggerId: () => triggerId,
    getRootNode: () => env().getRootNode(),
    detached: () => detached,
    setDetached: (on: boolean) => {
      if (on) pinned = true;
      detached = on;
    },
    pin: () => {
      pinned = true;
    },
    title: () => title,
    labels: () => arkhe().labels,
    announce: (text: string) => {
      arkhe().announcer.announce(text);
    },
  });
  $effect(() => {
    if (api.open) body.load();
  });
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
    sleeper.report({
      ...hint.trigger,
      ...cardTriggerAria({
        link: href !== undefined,
        inline: Boolean(inline),
        open: shownCard,
        contentId,
        bodyId: `${id}body`,
      }),
    });
  });
  onMount(() => {
    if ((card ?? arkhe().hoverCards) !== true) return;
    const el = elementById(env().getRootNode(), triggerId);
    if (waking === 'focus' && el?.matches(':focus') === true) {
      service.send({ type: 'TRIGGER_FOCUS' });
    }
    if (waking === 'hover' && sleeper.hovering()) {
      service.send({ type: 'POINTER_ENTER', src: 'trigger' });
    }
  });
</script>

{#if hint.mounted}<div
    class={ARKHE_CLASS}
    {...partAttrs('hover-card', 'frame')}
    data-detached={flag(detached)}
    use:portal={{
      container: env().container(),
      getRootNode: env().getRootNode,
    }}>
    <div {...mergeProps(api.getPositionerProps(), { hidden: !api.open })}>
      <div
        {...mergeProps(
          cardContentProps(api.getContentProps(), pinned, SVELTE_EVENTS),
          {
            role: 'dialog',
            'aria-labelledby': `${id}title`,
          },
        )}
        data-pinned={flag(pinned)}
        data-width={width}>
        <CardHeader
          {title}
          titleId={`${id}title`}
          href={headerLink === false ? undefined : href}
          {actions}
          {pinnable}
          {pinned}
          {detached}
          onMove={move}
          onTogglePin={togglePin}
          onClose={() => {
            elementById(env().getRootNode(), triggerId)?.focus();
            unpinAndClose();
          }} />
        <div {...partAttrs('hover-card', 'body')} id={`${id}body`}>
          <HintScope {node}>
            {@render content?.()}
            {#if body.state.status === 'loading'}
              <Status kind="loading" />
            {:else if body.state.status === 'error'}
              <Status kind="error" />
            {:else if body.state.status === 'ready'}
              {@render loaded?.(body.state.value)}
            {/if}
          </HintScope>
        </div>
      </div>
    </div>
  </div>{/if}

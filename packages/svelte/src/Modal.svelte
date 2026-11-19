<!--
@component
Renders a modal dialog on Zag's dialog machine, portalled into the
environment's container. The portal mounts on the client only, and Zag stays
closed until then, matching the React port. With `sheet` it rises from the
bottom edge. Once mounted it stays; the
`hidden` attribute plus CSS transitions animate entry and exit, so no presence
machine is needed.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    FocusReturn,
    dialogMachineProps,
    flag,
    hideShadowSiblings,
    watchCloseRequest,
    type DialogRole,
  } from '@arkhe/core';
  import * as dialog from '@zag-js/dialog';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { onMount, untrack, type Snippet } from 'svelte';
  import { useArkhe } from './context.js';
  import { useArkheEnvironment } from './environment.js';
  import Icon from './Icon.svelte';

  /**
   * Props of Modal.
   *
   * @interface Props
   * @property {string} title - Heading; names the dialog.
   * @property {string} [description] - Text under the heading; describes the dialog.
   * @property {string} [trigger] - Text of a built-in open button. Omit to open from state only.
   * @property {boolean} [open] - Open state; bindable. A function binding vetoes.
   * @property {boolean} [defaultOpen] - First open state when uncontrolled.
   * @property {(open: boolean) => void} [onOpenChange] - Reports open-state changes.
   * @property {DialogRole} [role] - `alertdialog` for confirmations. Defaults to `dialog`.
   * @property {() => HTMLElement | null} [initialFocus] - Element to focus on open. Defaults to the first focusable.
   * @property {() => HTMLElement | null} [finalFocus] - Element to focus on close; for when the opener is gone.
   * @property {boolean} [sheet] - Rises from the bottom edge at full width instead of centring.
   * @property {Snippet} [children] - Body.
   */
  interface Props {
    title: string;
    description?: string;
    trigger?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    role?: DialogRole;
    initialFocus?: () => HTMLElement | null;
    finalFocus?: () => HTMLElement | null;
    sheet?: boolean;
    children?: Snippet;
  }

  let {
    title,
    description,
    trigger,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    role,
    initialFocus,
    finalFocus,
    sheet,
    children,
  }: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const initial = untrack(() => defaultOpen ?? false);
  let mounted = $state(false);
  const focusReturn = new FocusReturn();
  $effect(() => focusReturn.watch(env().getRootNode()));

  onMount(() => {
    mounted = true;
  });

  const change = (next: boolean) => {
    open = next;
    onOpenChange?.(next);
  };

  const service = useMachine(dialog.machine, () =>
    dialogMachineProps({
      id,
      open: open ?? initial,
      ready: mounted,
      role,
      onOpenChange: change,
      initialFocus,
      finalFocus,
      focusReturn,
      getRootNode: env().getRootNode,
    }),
  );
  const api = $derived(dialog.connect(service, normalizeProps));
  let content = $state<HTMLDivElement>();
  $effect(() => {
    if (!api.open || !content) return;
    return hideShadowSiblings(content);
  });
  const shown = $derived(api.open);
  $effect(() => {
    if (!shown) return;
    return watchCloseRequest(env().getRootNode(), () =>
      untrack(() => api.setOpen(false)),
    );
  });
</script>

{#if trigger !== undefined}
  <button {...mergeProps(api.getTriggerProps(), { class: ARKHE_CLASS })}
    >{trigger}</button>
{/if}
{#if mounted}
  <div
    class={ARKHE_CLASS}
    use:portal={{
      container: env().container(),
      getRootNode: env().getRootNode,
    }}>
    <div {...api.getBackdropProps()}></div>
    <div {...api.getPositionerProps()} data-sheet={flag(sheet)}>
      <div
        bind:this={content}
        {...api.getContentProps()}
        data-sheet={flag(sheet)}
        aria-describedby={description === undefined
          ? undefined
          : api.getDescriptionProps().id}>
        <header data-scope="dialog" data-part="header">
          <h2 {...api.getTitleProps()}>{title}</h2>
          <button
            {...api.getCloseTriggerProps()}
            aria-label={arkhe().labels.close}><Icon name="x" /></button>
        </header>
        <div data-scope="dialog" data-part="body">
          {#if description !== undefined}<p {...api.getDescriptionProps()}>
              {description}
            </p>{/if}
          {@render children?.()}
        </div>
      </div>
    </div>
  </div>
{/if}

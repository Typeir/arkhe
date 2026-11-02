<!--
@component
Renders a modal dialog on Zag's dialog machine, portalled into the
environment's container. The portal mounts on the client only, and Zag stays
closed until then, matching the React port. Once mounted it stays; the
`hidden` attribute plus CSS transitions animate entry and exit, so no presence
machine is needed.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    FocusReturn,
    dialogMachineProps,
    hideShadowSiblings,
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
   * @property {() => HTMLElement | null} [finalFocus] - Element to focus on close; for when the opener is gone.
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
    finalFocus?: () => HTMLElement | null;
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
    finalFocus,
    children,
  }: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const initial = untrack(() => defaultOpen ?? false);
  let mounted = $state(false);
  const focusReturn = new FocusReturn();

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
    <div {...api.getPositionerProps()}>
      <div
        bind:this={content}
        {...api.getContentProps()}
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

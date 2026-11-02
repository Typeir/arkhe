<!--
@component
Renders a button that toggles a non-modal panel anchored to it, on Zag's
popover machine, portalled into the environment's container. Escape and
outside clicks close it; focus returns to the button.
-->
<script lang="ts">
  import {
    ARKHE_CLASS,
    floatingMachineProps,
    type Placement,
  } from '@arkhe/core';
  import * as popover from '@zag-js/popover';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import type { Snippet } from 'svelte';
  import { useArkhe } from './context.js';
  import { useArkheEnvironment } from './environment.js';
  import Icon from './Icon.svelte';

  /**
   * Props of Popover.
   *
   * @interface Props
   * @property {string} trigger - Text of the open button.
   * @property {string} [title] - Heading; names the panel. Without it the trigger text does.
   * @property {boolean} [open] - Open state; bindable. A function binding vetoes.
   * @property {boolean} [defaultOpen] - First open state when uncontrolled.
   * @property {(open: boolean) => void} [onOpenChange] - Reports open-state changes.
   * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
   * @property {Snippet} [children] - Panel body.
   */
  interface Props {
    trigger: string;
    title?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    children?: Snippet;
  }

  let {
    trigger,
    title,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    placement = 'bottom-start',
    children,
  }: Props = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const service = useMachine(popover.machine, () =>
    floatingMachineProps({
      id,
      open,
      defaultOpen,
      onOpenChange: (next: boolean) => {
        open = next;
        onOpenChange?.(next);
      },
      placement,
      getRootNode: env().getRootNode,
    }),
  );
  const api = $derived(popover.connect(service, normalizeProps));
</script>

<button {...mergeProps(api.getTriggerProps(), { class: ARKHE_CLASS })}
  >{trigger}<Icon name="chevron-down" /></button>
<div
  class={ARKHE_CLASS}
  use:portal={{ container: env().container(), getRootNode: env().getRootNode }}>
  <div {...api.getPositionerProps()}>
    <div
      {...api.getContentProps()}
      aria-label={title === undefined ? trigger : undefined}>
      <div data-scope="popover" data-part="header">
        {#if title !== undefined}<h2 {...api.getTitleProps()}>{title}</h2>{/if}
        <button
          {...api.getCloseTriggerProps()}
          aria-label={arkhe().labels.close}><Icon name="x" /></button>
      </div>
      <div data-scope="popover" data-part="body">{@render children?.()}</div>
    </div>
  </div>
</div>

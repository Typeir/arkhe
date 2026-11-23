<!--
@component
Renders a button that toggles a non-modal panel anchored to it, on Zag's
popover machine, portalled into the environment's container once mounted on
the client, so server markup holds the trigger alone. Escape and outside
clicks close it; focus returns to the button.
-->
<script module lang="ts">
  import type { Placement } from '@arkhe/core';
  import type { Snippet } from 'svelte';

  /**
   * Props of Popover.
   *
   * @interface PopoverProps
   * @property {string} trigger - Text of the open button.
   * @property {string} [title] - Heading; names the panel. Without it the trigger text does.
   * @property {boolean} [open] - Open state; bindable. A function binding vetoes.
   * @property {boolean} [defaultOpen] - First open state when uncontrolled.
   * @property {(open: boolean) => void} [onOpenChange] - Reports open-state changes.
   * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
   * @property {Snippet} [children] - Panel body.
   */
  export interface PopoverProps {
    trigger: string;
    title?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { ARKHE_CLASS, floatingMachineProps, partAttrs } from '@arkhe/core';
  import * as popover from '@zag-js/popover';
  import {
    mergeProps,
    normalizeProps,
    portal,
    useMachine,
  } from '@zag-js/svelte';
  import { useArkhe } from '../base/context.js';
  import { useArkheEnvironment } from '../base/environment.js';
  import Icon from '../base/Icon.svelte';
  import { useMounted } from '../base/mounted.svelte.js';

  let {
    trigger,
    title,
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    placement = 'bottom-start',
    children,
  }: PopoverProps = $props();
  const id = $props.id();
  const arkhe = useArkhe();
  const env = useArkheEnvironment();
  const commit = (next: boolean) => {
    open = next;
    onOpenChange?.(next);
  };
  const service = useMachine(popover.machine, () =>
    floatingMachineProps({
      id,
      open,
      defaultOpen,
      onOpenChange: commit,
      placement,
      getRootNode: env().getRootNode,
    }),
  );
  const api = $derived(popover.connect(service, normalizeProps));
  const mounted = useMounted();
</script>

<button {...mergeProps(api.getTriggerProps(), { class: ARKHE_CLASS })}
  >{trigger}<Icon name="chevron-down" /></button>
{#if mounted.current}
  <div
    class={ARKHE_CLASS}
    use:portal={{
      container: env().container(),
      getRootNode: env().getRootNode,
    }}>
    <div {...api.getPositionerProps()}>
      <div
        {...api.getContentProps()}
        aria-label={title === undefined ? trigger : undefined}>
        <div {...partAttrs('popover', 'header')}>
          {#if title !== undefined}<h2 {...api.getTitleProps()}>
              {title}
            </h2>{/if}
          <button
            {...api.getCloseTriggerProps()}
            aria-label={arkhe().labels.close}><Icon name="x" /></button>
        </div>
        <div {...partAttrs('popover', 'body')}>{@render children?.()}</div>
      </div>
    </div>
  </div>
{/if}

<!--
@component
Renders a button, or a link when `href` is set. A disabled link is a plain
anchor that keeps its text but loses its address, click and tab stop.
-->
<script lang="ts">
  import { ARKHE_CLASS, flag, partAttrs } from '@arkhe/core';
  import type { Snippet } from 'svelte';
  import { useArkhe } from './context.js';
  import Icon from './Icon.svelte';

  /**
   * Props of Button.
   *
   * @interface Props
   * @property {Snippet} [children] - Visible text. Omit for an icon-only button.
   * @property {'default' | 'primary' | 'ghost' | 'danger'} [variant] - Visual weight. Defaults to `default`.
   * @property {string} [icon] - Lucide name of a leading icon.
   * @property {string} [label] - Accessible name; required for icon-only buttons.
   * @property {'square' | 'rhombus'} [shape] - Outline. Icon-only: the box. Labelled: `rhombus` is a ghost label with the icon in a rhombus. Defaults to `square`.
   * @property {'xs' | 's' | 'm' | 'l' | 'xl'} [size] - Glyph scale; an icon-only box scales with it. Unset keeps the text-sized glyph.
   * @property {boolean} [pressed] - Toggle state; sets `aria-pressed`.
   * @property {string} [href] - Renders a link to this address.
   * @property {boolean} [disabled] - Blocks interaction.
   * @property {'button' | 'submit' | 'reset'} [type] - Button type. Defaults to `button`.
   * @property {(event: MouseEvent) => void} [onclick] - Click handler.
   */
  interface Props {
    children?: Snippet;
    variant?: 'default' | 'primary' | 'ghost' | 'danger';
    icon?: string;
    label?: string;
    shape?: 'square' | 'rhombus';
    size?: 'xs' | 's' | 'm' | 'l' | 'xl';
    pressed?: boolean;
    href?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
  }

  let {
    children,
    variant = 'default',
    icon,
    label,
    shape,
    size,
    pressed,
    href,
    disabled,
    type = 'button',
    onclick,
  }: Props = $props();
  const arkhe = useArkhe();
  const Link = $derived(arkhe().link);
  const shared = $derived({
    class: ARKHE_CLASS,
    ...partAttrs('button', 'root'),
    'data-variant': variant,
    'data-icon-only': flag(children === undefined),
    'data-shape': shape,
    'data-size': size,
    'aria-label': label,
    'aria-pressed': pressed,
    onclick,
  });
  const deadAttrs = $derived({
    ...shared,
    onclick: undefined,
    'aria-disabled': true,
    tabindex: -1,
  });
</script>

{#snippet content()}
  {#if icon}<Icon name={icon} />{/if}{@render children?.()}
{/snippet}

{#if href !== undefined && disabled}
  <a {...deadAttrs}>{@render content()}</a>
{:else if href !== undefined && Link}
  <Link {...shared} {href}>{@render content()}</Link>
{:else if href !== undefined}
  <a {...shared} {href}>{@render content()}</a>
{:else}
  <button {...shared} {type} {disabled}>{@render content()}</button>
{/if}

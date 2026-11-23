<!--
@component
Renders a button, or a link when `href` is set. A disabled link is a plain
anchor that keeps its text but loses its address, click and tab stop.
-->
<script module lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Visual weight of a button.
   *
   * @typedef {'default' | 'primary' | 'ghost' | 'danger'} ButtonVariant
   */
  export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';

  /**
   * Glyph scale of a button; an icon-only box scales with it.
   *
   * @typedef {'xs' | 's' | 'm' | 'l' | 'xl'} ButtonSize
   */
  export type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl';

  /**
   * Colour a button lights up in on hover and focus.
   *
   * @typedef {'accent' | 'danger' | 'inherit'} ButtonTone
   */
  export type ButtonTone = 'accent' | 'danger' | 'inherit';

  /**
   * Props of Button.
   *
   * @interface ButtonProps
   * @property {Snippet} [children] - Visible text. Omit for an icon-only button.
   * @property {ButtonVariant} [variant] - Visual weight. Defaults to `default`.
   * @property {string} [icon] - Lucide name of the icon.
   * @property {'start' | 'end'} [iconSide] - Side of the text the icon sits on. Defaults to `start`.
   * @property {string} [label] - Accessible name of an icon-only button; visible text names the others.
   * @property {'square' | 'rhombus' | 'plain'} [shape] - Outline. Icon-only: the box, or `plain` for the glyph alone. Labelled: `rhombus` is a ghost label with the icon in a rhombus. Defaults to `square`.
   * @property {ButtonSize} [size] - Glyph scale; an icon-only box scales with it. Unset keeps the text-sized glyph.
   * @property {ButtonTone} [tone] - Hover and focus colour. Defaults to `accent`.
   * @property {boolean} [dashed] - Dashed emphasis outline, for an add action.
   * @property {boolean} [pressed] - Toggle state; sets `aria-pressed`.
   * @property {string} [href] - Renders a link to this address.
   * @property {boolean} [disabled] - Blocks interaction.
   * @property {'button' | 'submit' | 'reset'} [type] - Button type. Defaults to `button`.
   * @property {(event: MouseEvent) => void} [onclick] - Click handler.
   */
  export interface ButtonProps {
    children?: Snippet;
    variant?: ButtonVariant;
    icon?: string;
    iconSide?: 'start' | 'end';
    label?: string;
    shape?: 'square' | 'rhombus' | 'plain';
    size?: ButtonSize;
    tone?: ButtonTone;
    dashed?: boolean;
    pressed?: boolean;
    href?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (event: MouseEvent) => void;
  }
</script>

<script lang="ts">
  import { ARKHE_CLASS, flag, partAttrs } from '@arkhe/core';
  import { useArkhe } from '../base/context.js';
  import Icon from '../base/Icon.svelte';

  let {
    children,
    variant = 'default',
    icon,
    iconSide,
    label,
    shape,
    size,
    tone,
    dashed,
    pressed,
    href,
    disabled,
    type = 'button',
    onclick,
  }: ButtonProps = $props();
  const arkhe = useArkhe();
  const Link = $derived(arkhe().link);
  const shared = $derived({
    class: ARKHE_CLASS,
    ...partAttrs('button', 'root'),
    'data-variant': variant,
    'data-icon-only': flag(children === undefined),
    'data-shape': shape,
    'data-size': size,
    'data-tone': tone,
    'data-dashed': flag(dashed),
    'data-icon-side': iconSide,
    'aria-label': children === undefined ? label : undefined,
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

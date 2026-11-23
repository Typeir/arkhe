/**
 * @fileoverview Button: text, icon, icon-only, toggle or link, one component.
 * Links render through the provider's link component.
 *
 * @module packages/react/src/action/Button
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import type { JSX, MouseEventHandler, ReactNode } from 'react';
import { ARKHE_CLASS, flag, hasText, partAttrs } from '@arkhe/core';
import { useArkhe } from '../base/ArkheProvider.js';
import { Icon } from '../base/Icon.js';

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
 * @property {ReactNode} [children] - Visible text. Omit for an icon-only button.
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
 * @property {MouseEventHandler<HTMLElement>} [onClick] - Click handler.
 */
export interface ButtonProps {
  readonly children?: ReactNode;
  readonly variant?: ButtonVariant;
  readonly icon?: string;
  readonly iconSide?: 'start' | 'end';
  readonly label?: string;
  readonly shape?: 'square' | 'rhombus' | 'plain';
  readonly size?: ButtonSize;
  readonly tone?: ButtonTone;
  readonly dashed?: boolean;
  readonly pressed?: boolean;
  readonly href?: string;
  readonly disabled?: boolean;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly onClick?: MouseEventHandler<HTMLElement>;
}

/**
 * Renders a button, or a link when `href` is set. A disabled link is a plain
 * anchor that keeps its text but loses its address, click and tab stop.
 *
 * @component
 * @param {ButtonProps} props - Component props.
 * @param {ReactNode} [props.children] - Visible text.
 * @param {ButtonVariant} [props.variant] - Visual weight.
 * @param {string} [props.icon] - Lucide name of the icon.
 * @param {'start' | 'end'} [props.iconSide] - Icon side.
 * @param {string} [props.label] - Accessible name.
 * @param {'square' | 'rhombus' | 'plain'} [props.shape] - Outline.
 * @param {ButtonSize} [props.size] - Glyph scale.
 * @param {ButtonTone} [props.tone] - Hover colour.
 * @param {boolean} [props.dashed] - Dashed outline.
 * @param {boolean} [props.pressed] - Toggle state.
 * @param {string} [props.href] - Link address.
 * @param {boolean} [props.disabled] - Blocks interaction.
 * @param {'button' | 'submit' | 'reset'} [props.type] - Button type.
 * @param {MouseEventHandler<HTMLElement>} [props.onClick] - Click handler.
 * @returns {JSX.Element} Button or link.
 */
export const Button = ({
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
  onClick,
}: ButtonProps): JSX.Element => {
  const { link: Link } = useArkhe();
  const shared = {
    className: ARKHE_CLASS,
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
    onClick,
  };
  const content = (
    <>
      {hasText(icon) ? <Icon name={icon} /> : null}
      {children}
    </>
  );
  if (href !== undefined && disabled) {
    return (
      <a {...shared} onClick={undefined} aria-disabled tabIndex={-1}>
        {content}
      </a>
    );
  }
  if (href !== undefined) {
    return (
      <Link {...shared} href={href}>
        {content}
      </Link>
    );
  }
  return (
    <button {...shared} type={type} disabled={disabled}>
      {content}
    </button>
  );
};

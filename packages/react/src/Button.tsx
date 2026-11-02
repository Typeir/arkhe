/**
 * @fileoverview Button: text, icon, icon-only, toggle or link, one component.
 * Links render through the provider's link component.
 *
 * @module packages/react/src/Button
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ARKHE_CLASS, flag, partAttrs } from '@arkhe/core';
import type { JSX, MouseEventHandler, ReactNode } from 'react';
import { useArkhe } from './ArkheProvider.js';
import { Icon } from './Icon.js';

/**
 * Visual weight of a button.
 *
 * @typedef {'default' | 'primary' | 'ghost' | 'danger'} ButtonVariant
 */
export type ButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';

/**
 * Props of Button.
 *
 * @interface ButtonProps
 * @property {ReactNode} [children] - Visible text. Omit for an icon-only button.
 * @property {ButtonVariant} [variant] - Visual weight. Defaults to `default`.
 * @property {string} [icon] - Lucide name of a leading icon.
 * @property {string} [label] - Accessible name; required for icon-only buttons.
 * @property {'square' | 'rhombus'} [shape] - Icon-only outline. Defaults to `square`.
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
  readonly label?: string;
  readonly shape?: 'square' | 'rhombus';
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
 * @param {string} [props.icon] - Lucide name of a leading icon.
 * @param {string} [props.label] - Accessible name.
 * @param {'square' | 'rhombus'} [props.shape] - Icon-only outline.
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
  label,
  shape,
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
    'aria-label': label,
    'aria-pressed': pressed,
    onClick,
  };
  const content = (
    <>
      {icon ? <Icon name={icon} /> : null}
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

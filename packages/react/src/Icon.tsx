/**
 * @fileoverview Icon by Lucide name, drawn from the provider's icon sets.
 *
 * @module packages/react/src/Icon
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ARKHE_CLASS, flag, partAttrs, resolveIcon } from '@arkhe/core';
import { createElement, type JSX } from 'react';
import { useArkhe } from './ArkheProvider.js';
import { LUCIDE_ICONS } from './lucideIcons.js';

/**
 * Props of Icon.
 *
 * @interface IconProps
 * @property {string} name - Lucide name, e.g. `triangle-alert`.
 * @property {string} [label] - Accessible name; without it the icon is decorative.
 */
export interface IconProps {
  readonly name: string;
  readonly label?: string;
}

/**
 * Draws the icon named `name` from the app's sets, then the bundled Lucide
 * default. Only Icon imports Lucide, so components without icons skip it.
 * An unknown name renders an empty slot marked
 * `data-missing`.
 *
 * @component
 * @param {IconProps} props - Component props.
 * @param {string} props.name - Lucide name.
 * @param {string} [props.label] - Accessible name.
 * @returns {JSX.Element} Icon slot.
 */
export const Icon = ({ name, label }: IconProps): JSX.Element => {
  const { icons } = useArkhe();
  const Glyph = resolveIcon([...icons, LUCIDE_ICONS], name);
  return (
    <span
      className={ARKHE_CLASS}
      {...partAttrs('icon', 'root')}
      data-name={name}
      data-missing={flag(!Glyph)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}>
      {Glyph ? createElement(Glyph, { 'aria-hidden': true }) : null}
    </span>
  );
};

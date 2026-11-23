/**
 * @fileoverview Default body of an option in a select or combobox list:
 * icon, label, then a muted description. Not exported.
 *
 * @module packages/react/src/select/optionBody
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import type { ReactNode } from 'react';
import { hasText, partAttrs, type SelectOption } from '@arkhe/core';
import { Icon } from '../base/Icon.js';

/**
 * Renders the default option body: icon, label, then a muted description.
 *
 * @function optionBody
 * @param {SelectOption} item - Option.
 * @param {'combobox' | 'select'} scope - Zag scope of the list.
 * @returns {ReactNode} Body.
 */
export function optionBody(
  item: SelectOption,
  scope: 'combobox' | 'select',
): ReactNode {
  return (
    <>
      {hasText(item.icon) ? <Icon name={item.icon} /> : null}
      <span {...partAttrs(scope, 'item-label')}>{item.label}</span>
      {hasText(item.description) ? (
        <span {...partAttrs(scope, 'item-description')}>
          {item.description}
        </span>
      ) : null}
    </>
  );
}

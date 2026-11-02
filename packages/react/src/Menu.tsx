/**
 * @fileoverview Menu: a button that opens a list of actions, on Zag's menu
 * machine. Arrow keys, Home, End and typeahead move; focus returns to the
 * button on close.
 *
 * @module packages/react/src/Menu
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  entryKey,
  floatingMachineProps,
  isSeparator,
  type MenuEntry,
  type Placement,
} from '@arkhe/core';
import * as menu from '@zag-js/menu';
import { Portal, mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import { useId, type JSX } from 'react';
import { useArkheEnvironment } from './ArkheEnvironment';
import { Icon } from './Icon';
import { usePortalContainer } from './usePortalContainer';

/**
 * Props of Menu.
 *
 * @interface MenuProps
 * @property {string} trigger - Text of the open button.
 * @property {readonly MenuEntry[]} items - Actions and separators.
 * @property {(value: string) => void} onSelect - Called with the chosen action.
 * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
 */
export interface MenuProps {
  readonly trigger: string;
  readonly items: readonly MenuEntry[];
  readonly onSelect: (value: string) => void;
  readonly placement?: Placement;
}

/**
 * Renders a menu button and its action list.
 *
 * @component
 * @param {MenuProps} props - Trigger, entries, select callback.
 * @returns {JSX.Element} Trigger and portalled list.
 */
export const Menu = ({
  trigger,
  items,
  onSelect,
  placement = 'bottom-start',
}: MenuProps): JSX.Element => {
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const service = useMachine(menu.machine, {
    ...floatingMachineProps({
      id: useId(),
      placement,
      getRootNode: env.getRootNode,
    }),
    onSelect: (details) => onSelect(details.value),
  });
  const api = menu.connect(service, normalizeProps);
  return (
    <>
      <button
        {...mergeProps(api.getTriggerProps(), { className: ARKHE_CLASS })}>
        {trigger}
        <Icon name='chevron-down' />
      </button>
      <Portal container={container} getRootNode={env.getRootNode}>
        <div className={ARKHE_CLASS}>
          <div {...api.getPositionerProps()}>
            <ul {...api.getContentProps()}>
              {items.map((entry, index) =>
                isSeparator(entry) ? (
                  <li
                    key={entryKey(entry, index)}
                    {...api.getSeparatorProps()}
                  />
                ) : (
                  <li
                    key={entryKey(entry, index)}
                    {...api.getItemProps({
                      value: entry.value,
                      disabled: entry.disabled,
                    })}
                    data-danger={entry.danger ? '' : undefined}>
                    {entry.icon ? <Icon name={entry.icon} /> : null}
                    {entry.label}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </Portal>
    </>
  );
};

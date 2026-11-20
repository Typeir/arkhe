/**
 * @fileoverview Menu: a button that opens a list of actions, on Zag's menu
 * machine. Arrow keys, Home, End and typeahead move; focus returns to the
 * button on close. The list portals in once hydrated.
 *
 * @module packages/react/src/action/Menu
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  entryKey,
  flag,
  floatingMachineProps,
  isSeparator,
  type MenuEntry,
  type Placement,
} from '@arkhe/core';
import * as menu from '@zag-js/menu';
import { Portal, mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import { useId, type JSX } from 'react';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';
import { Icon } from '../base/Icon.js';
import { useHydrated } from '../base/useHydrated.js';
import { usePortalContainer } from '../base/usePortalContainer.js';

/**
 * Props of Menu.
 *
 * @interface MenuProps
 * @property {string} trigger - Text of the open button; its accessible name when `icon` is set.
 * @property {string} [icon] - Lucide name; makes the open button icon-only.
 * @property {readonly MenuEntry[]} items - Actions and separators.
 * @property {(value: string) => void} onSelect - Called with the chosen action.
 * @property {Placement} [placement] - Side. Defaults to `bottom-start`.
 */
export interface MenuProps {
  readonly trigger: string;
  readonly icon?: string;
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
  icon,
  items,
  onSelect,
  placement = 'bottom-start',
}: MenuProps): JSX.Element => {
  const env = useArkheEnvironment();
  const container = usePortalContainer();
  const hydrated = useHydrated();
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
        {...mergeProps(api.getTriggerProps(), {
          className: ARKHE_CLASS,
          'aria-label': icon ? trigger : undefined,
        })}
        data-icon-only={flag(icon !== undefined)}>
        {icon ? (
          <Icon name={icon} />
        ) : (
          <>
            {trigger}
            <Icon name='chevron-down' />
          </>
        )}
      </button>
      {hydrated ? (
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
      ) : null}
    </>
  );
};

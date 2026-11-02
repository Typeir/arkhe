/**
 * @fileoverview Modal on Zag's dialog machine. Stays mounted once hydrated;
 * the `hidden` attribute plus CSS transitions animate entry and exit, so no
 * presence machine is needed.
 *
 * @module packages/react/src/Modal
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ARKHE_CLASS, dialogMachineProps, type DialogRole } from '@arkhe/core';
import * as dialog from '@zag-js/dialog';
import { Portal, mergeProps, normalizeProps, useMachine } from '@zag-js/react';
import {
  useId,
  useState,
  useSyncExternalStore,
  type JSX,
  type ReactNode,
} from 'react';
import { useArkhe } from './ArkheProvider';
import { useArkheEnvironment } from './ArkheEnvironment';
import { Icon } from './Icon';
import { usePortalContainer } from './usePortalContainer';

/**
 * Props of Modal.
 *
 * @interface ModalProps
 * @property {string} title - Heading; names the dialog.
 * @property {string} [description] - Text under the heading; describes the dialog.
 * @property {string} [trigger] - Text of a built-in open button. Omit to open from state only.
 * @property {boolean} [open] - Open state; makes the modal controlled.
 * @property {boolean} [defaultOpen] - First open state when uncontrolled.
 * @property {(open: boolean) => void} [onOpenChange] - Open-state callback.
 * @property {DialogRole} [role] - `alertdialog` for confirmations. Defaults to `dialog`.
 * @property {ReactNode} [children] - Body.
 */
export interface ModalProps {
  readonly title: string;
  readonly description?: string;
  readonly trigger?: string;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly role?: DialogRole;
  readonly children?: ReactNode;
}

/**
 * Store subscription that never fires: hydration state only flips once.
 *
 * @function subscribeNever
 * @returns {() => void} No-op unsubscribe.
 */
function subscribeNever(): () => void {
  return () => undefined;
}

/**
 * Renders a modal dialog. The portal mounts after hydration so server HTML
 * matches the client; Zag stays closed until then, or its focus trap and
 * title check would run before the content exists.
 *
 * @component
 * @param {ModalProps} props - Title, open state, body.
 * @returns {JSX.Element} Trigger and portal.
 */
export const Modal = ({
  title,
  description,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  role,
  children,
}: ModalProps): JSX.Element => {
  const { labels } = useArkhe();
  const env = useArkheEnvironment();
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const [inner, setInner] = useState(defaultOpen ?? false);
  const change = (next: boolean) => {
    setInner(next);
    onOpenChange?.(next);
  };
  const service = useMachine(
    dialog.machine,
    dialogMachineProps({
      id: useId(),
      open: open ?? inner,
      ready: hydrated,
      role,
      onOpenChange: change,
      getRootNode: env.getRootNode,
    }),
  );
  const api = dialog.connect(service, normalizeProps);
  const container = usePortalContainer();
  return (
    <>
      {trigger === undefined ? null : (
        <button
          {...mergeProps(api.getTriggerProps(), { className: ARKHE_CLASS })}>
          {trigger}
        </button>
      )}
      {hydrated ? (
        <Portal container={container} getRootNode={env.getRootNode}>
          <div className={ARKHE_CLASS}>
            <div {...api.getBackdropProps()} />
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                <header data-scope='dialog' data-part='header'>
                  <h2 {...api.getTitleProps()}>{title}</h2>
                  <button
                    {...api.getCloseTriggerProps()}
                    aria-label={labels.close}>
                    <Icon name='x' />
                  </button>
                </header>
                <div data-scope='dialog' data-part='body'>
                  {description === undefined ? null : (
                    <p {...api.getDescriptionProps()}>{description}</p>
                  )}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  );
};

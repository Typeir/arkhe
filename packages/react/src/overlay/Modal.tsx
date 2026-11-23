/**
 * @fileoverview Modal on Zag's dialog machine. Stays mounted once hydrated;
 * the `hidden` attribute plus CSS transitions animate entry and exit, so no
 * presence machine is needed.
 *
 * @module packages/react/src/overlay/Modal
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import {
  ARKHE_CLASS,
  dialogMachineProps,
  type DialogRole,
  flag,
  FocusReturn,
  hideShadowSiblings,
  partAttrs,
  watchCloseRequest,
} from '@arkhe/core';
import * as dialog from '@zag-js/dialog';
import { mergeProps, normalizeProps, Portal, useMachine } from '@zag-js/react';
import {
  type JSX,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from 'react';
import { useArkheEnvironment } from '../base/ArkheEnvironment.js';
import { useArkhe } from '../base/ArkheProvider.js';
import { Icon } from '../base/Icon.js';
import { useControllable } from '../base/useControllable.js';
import { useHydrated } from '../base/useHydrated.js';
import { usePortalContainer } from '../base/usePortalContainer.js';

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
 * @property {() => HTMLElement | null} [initialFocus] - Element to focus on open. Defaults to the first focusable.
 * @property {() => HTMLElement | null} [finalFocus] - Element to focus on close; for when the opener is gone.
 * @property {boolean} [sheet] - Rises from the bottom edge at full width instead of centring.
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
  readonly initialFocus?: () => HTMLElement | null;
  readonly finalFocus?: () => HTMLElement | null;
  readonly sheet?: boolean;
  readonly children?: ReactNode;
}

/**
 * Renders a modal dialog, centred or as a bottom sheet. The portal mounts after hydration so server HTML
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
  initialFocus,
  finalFocus,
  sheet,
  children,
}: ModalProps): JSX.Element => {
  const { labels } = useArkhe();
  const env = useArkheEnvironment();
  const hydrated = useHydrated();
  const { current: shown, commit } = useControllable({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const [focusReturn] = useState(() => new FocusReturn());
  useEffect(() => focusReturn.watch(env.getRootNode()), [focusReturn, env]);
  const id = useId();
  const service = useMachine(
    dialog.machine,
    dialogMachineProps({
      id,
      open: shown,
      ready: hydrated,
      role,
      onOpenChange: commit,
      initialFocus,
      finalFocus,
      focusReturn,
      getRootNode: env.getRootNode,
    }),
  );
  const api = dialog.connect(service, normalizeProps);
  const container = usePortalContainer();
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!api.open || !content.current) return undefined;
    return hideShadowSiblings(content.current);
  }, [api.open]);
  const requestClose = useEffectEvent(() => {
    api.setOpen(false);
  });
  useEffect(() => {
    if (!api.open) return undefined;
    return watchCloseRequest(env.getRootNode(), requestClose);
  }, [api.open, env]);
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
            <div {...api.getPositionerProps()} data-sheet={flag(sheet)}>
              <div
                ref={content}
                {...api.getContentProps()}
                data-sheet={flag(sheet)}
                aria-describedby={
                  description === undefined
                    ? undefined
                    : api.getDescriptionProps().id
                }>
                <div {...partAttrs('dialog', 'header')}>
                  <h2 {...api.getTitleProps()}>{title}</h2>
                  <button
                    {...api.getCloseTriggerProps()}
                    aria-label={labels.close}>
                    <Icon name='x' />
                  </button>
                </div>
                <div {...partAttrs('dialog', 'body')}>
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

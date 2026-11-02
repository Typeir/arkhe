/**
 * @fileoverview Text controls: single-line input and multi-line area, with
 * every native attribute passed through.
 *
 * @module packages/react/src/TextInput
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

'use client';

import { ARKHE_CLASS, partAttrs } from '@arkhe/core';
import type { InputHTMLAttributes, JSX, TextareaHTMLAttributes } from 'react';

/**
 * Props of TextInput: native input attributes, minus `className`.
 *
 * @typedef {Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>} TextInputProps
 */
export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className'
>;

/**
 * Props of TextArea: native textarea attributes, minus `className`.
 *
 * @typedef {Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>} TextAreaProps
 */
export type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
>;

/**
 * Renders a single-line text input. Type defaults to `text`.
 *
 * @component
 * @param {TextInputProps} props - Native input attributes.
 * @returns {JSX.Element} Input.
 */
export const TextInput = ({
  type = 'text',
  ...rest
}: TextInputProps): JSX.Element => (
  <input
    {...rest}
    type={type}
    className={ARKHE_CLASS}
    {...partAttrs('text-input', 'root')}
  />
);

/**
 * Renders a multi-line text area.
 *
 * @component
 * @param {TextAreaProps} props - Native textarea attributes.
 * @returns {JSX.Element} Text area.
 */
export const TextArea = (props: TextAreaProps): JSX.Element => (
  <textarea
    {...props}
    className={ARKHE_CLASS}
    {...partAttrs('text-area', 'root')}
  />
);

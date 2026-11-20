/**
 * @fileoverview React side of the form control parity scenes. Each must
 * match its twin in `SvelteFormCases.svelte`.
 *
 * @module tests/parity/ReactFormCases
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { Checkbox, RadioGroup, ToggleGroup } from '@arkhe/react';
import type { ReactNode } from 'react';
import { ASPECT_ITEMS, UNIT_ITEMS } from './scenes';

/**
 * Form control scenes by name.
 *
 * @constant FORM_SCENES
 * @type {Readonly<Record<string, () => ReactNode>>}
 */
export const FORM_SCENES: Readonly<Record<string, () => ReactNode>> = {
  checkbox: () => (
    <>
      <Checkbox label='Use GPU' />
      <Checkbox label='Clamp' look='box' size='s' defaultChecked />
      <Checkbox label='All' size='l' indeterminate hint='Some chosen.' />
      <Checkbox label='Slain' name='slain' value='yes' error='Required.' />
      <Checkbox label='Proficient' labelHidden disabled />
    </>
  ),
  'radio-group': () => (
    <>
      <RadioGroup label='Units' items={UNIT_ITEMS} defaultValue='metric' />
      <RadioGroup
        label='Shape'
        items={UNIT_ITEMS}
        look='segmented'
        name='shape'
        hint='Halftone dots.'
      />
      <RadioGroup
        label='Blend'
        items={UNIT_ITEMS}
        orientation='vertical'
        labelHidden
        error='Pick one.'
        required
      />
    </>
  ),
  'toggle-group': () => (
    <>
      <ToggleGroup
        label='Aspects'
        items={ASPECT_ITEMS}
        multiple
        clearable
        limit={2}
        defaultValue={['storm']}
      />
      <ToggleGroup
        label='Focus'
        items={UNIT_ITEMS}
        orientation='vertical'
        deselectable
      />
    </>
  ),
};

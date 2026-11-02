/**
 * @fileoverview React side of the parity scenes. Each scene must match its
 * twin in `SvelteCases.svelte` element for element.
 *
 * @module tests/parity/ReactCases
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  Button,
  Chip,
  Combobox,
  Field,
  HoverCard,
  Icon,
  Menu,
  Modal,
  NumericInput,
  Popover,
  Progress,
  Skeleton,
  SkeletonGroup,
  Status,
  Tabs,
  TextArea,
  TextInput,
  Tooltip,
} from '@arkhe/react';
import { useState, type JSX, type ReactNode } from 'react';
import {
  COMBO_ITEMS,
  MENU_ITEMS,
  TAB_ITEMS,
  TAB_STAGES,
  TAB_TEXT,
} from './scenes';

const Buttons = (): JSX.Element => {
  const [pressed, setPressed] = useState(false);
  return (
    <>
      <Button>Default</Button>
      <Button variant='primary'>Primary</Button>
      <Button variant='ghost' icon='plus'>
        New
      </Button>
      <Button variant='danger' disabled>
        Danger
      </Button>
      <Button icon='x' label='Close' />
      <Button icon='plus' label='Add' shape='rhombus' />
      <Button pressed={pressed} onClick={() => setPressed(!pressed)}>
        Toggle
      </Button>
      <Button href='#a'>Link</Button>
      <Button href='#b' disabled>
        Dead link
      </Button>
    </>
  );
};

const ChangingTabs = (): JSX.Element => {
  const [stage, setStage] = useState(0);
  return (
    <>
      <Button onClick={() => setStage(stage + 1)}>Change tabs</Button>
      <Tabs
        items={TAB_STAGES[stage] ?? TAB_ITEMS}
        label='Sheet'
        panels={TAB_TEXT}
      />
    </>
  );
};

const SCENES: Readonly<Record<string, () => ReactNode>> = {
  buttons: () => <Buttons />,
  chips: () => (
    <>
      <Chip label='neutral' />
      <Chip label='accent' tone='accent' icon='check' />
      <Chip label='charge' onRemove={() => undefined} />
    </>
  ),
  fields: () => (
    <>
      <Field label='Name' readout='6 / 24' hint='Shown on the sheet.'>
        {(control) => <TextInput {...control} defaultValue='Rhomus' />}
      </Field>
      <Field label='Bloodline' error='Pick one.'>
        {(control) => <TextInput {...control} placeholder='Homunculus' />}
      </Field>
      <Field label='Notes'>
        {(control) => <TextArea {...control} rows={3} />}
      </Field>
    </>
  ),
  icons: () => (
    <>
      <Icon name='check' />
      <Icon name='info' label='Details' />
      <Icon name='not-an-icon' />
    </>
  ),
  progress: () => (
    <>
      <Progress value={5} max={10} label='Budget' markers={[2, 8]} showValue />
      <Progress value={13} max={10} label='Load' />
    </>
  ),
  skeleton: () => (
    <SkeletonGroup>
      <Skeleton width='40%' />
      <Skeleton shape='block' height='3rem' />
    </SkeletonGroup>
  ),
  status: () => (
    <>
      <Status kind='empty' />
      <Status kind='loading' />
      <Status kind='error' />
      <Status kind='info'>Two rolls left.</Status>
    </>
  ),
  numeric: () => (
    <NumericInput label='Speed' defaultValue={3} min={0} max={10} />
  ),
  tabs: () => <Tabs items={TAB_ITEMS} label='Sheet' panels={TAB_TEXT} />,
  'tabs-change': () => <ChangingTabs />,
  modal: () => (
    <Modal title='Rest' description='Recover.' trigger='Open'>
      Body
    </Modal>
  ),
  tooltip: () => (
    <Tooltip content='Halves damage.' openDelay={0} closeDelay={0}>
      resistance
    </Tooltip>
  ),
  'hover-card': () => (
    <HoverCard title='Charge' openDelay={0} content='Spend to act twice.'>
      charge
    </HoverCard>
  ),
  popover: () => (
    <Popover trigger='Filters' title='Filter by'>
      Body
    </Popover>
  ),
  menu: () => (
    <Menu trigger='Actions' items={MENU_ITEMS} onSelect={() => undefined} />
  ),
  combobox: () => <Combobox label='Spell' items={COMBO_ITEMS} />,
};

/**
 * Renders the named scene.
 *
 * @component
 * @param {{ name: string }} props - Scene name.
 * @returns {JSX.Element} Scene.
 */
export const ReactCases = ({ name }: { name: string }): JSX.Element => (
  <>{SCENES[name]?.() ?? `missing scene ${name}`}</>
);

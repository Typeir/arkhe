/**
 * @fileoverview React specimen: every Arkhé component with the shared
 * specimen data.
 *
 * @module apps/showcase/src/react/Specimen
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  ArkheProvider,
  Button,
  Chip,
  Field,
  HoverCard,
  Icon,
  Menu,
  Modal,
  NumericInput,
  Popover,
  Progress,
  Status,
  Tabs,
  TextArea,
  TextInput,
  Tooltip,
  type ChipTone,
  type NumericValue,
} from '@arkhe/react';
import { useState, type JSX, type ReactNode } from 'react';
import {
  SPECIMEN_BUTTON_SIZES,
  SPECIMEN_CHIPS,
  SPECIMEN_ICONS,
  SPECIMEN_MENU,
  SPECIMEN_PROGRESS,
  SPECIMEN_SECTIONS,
  SPECIMEN_TABS,
  SPECIMEN_TAB_TEXT,
  SPECIMEN_TONES,
  clampTen,
  loadSpecimenCard,
  nameReadout,
} from '../specimen';
import { SelectSection } from './SelectSection';
import { SkeletonSection } from './SkeletonSection';

const Section = ({
  id,
  children,
}: {
  readonly id: keyof typeof SPECIMEN_SECTIONS;
  readonly children: ReactNode;
}): JSX.Element => (
  <section className='specimen' id={id}>
    <h2>{SPECIMEN_SECTIONS[id]}</h2>
    <div className='row'>{children}</div>
  </section>
);

/**
 * Renders the specimen page.
 *
 * @component
 * @returns {JSX.Element} Specimen.
 */
export const Specimen = (): JSX.Element => {
  const [pressed, setPressed] = useState(false);
  const [name, setName] = useState('Rhomus');
  const [chips, setChips] = useState<readonly string[]>(SPECIMEN_CHIPS);
  const [value, setValue] = useState<number>(SPECIMEN_PROGRESS.start);
  const [clamped, setClamped] = useState<NumericValue>(5);
  const [picked, setPicked] = useState('nothing yet');
  return (
    <main>
      <Section id='buttons'>
        <Button>Default</Button>
        <Button variant='primary'>Primary</Button>
        <Button variant='ghost'>Ghost</Button>
        <Button variant='danger'>Danger</Button>
        <Button icon='plus'>New</Button>
        <Button icon='x' label='Close' />
        <Button icon='plus' label='Add' shape='rhombus' />
        <Button icon='x' label='Remove' shape='rhombus' variant='danger' />
        {SPECIMEN_BUTTON_SIZES.map((size) => (
          <Button key={size} icon='x' label={`Close ${size}`} size={size} />
        ))}
        <Button icon='plus' shape='rhombus' size='s'>
          Add spell
        </Button>
        <Button pressed={pressed} onClick={() => setPressed(!pressed)}>
          Toggle
        </Button>
        <Button disabled>Disabled</Button>
        <Button href='#buttons'>Link</Button>
      </Section>
      <Section id='fields'>
        <Field
          label='Name'
          readout={nameReadout(name)}
          hint='Shown on the sheet.'>
          {(control) => (
            <TextInput
              {...control}
              value={name}
              maxLength={24}
              onChange={(event) => setName(event.target.value)}
            />
          )}
        </Field>
        <Field label='Bloodline' error='Pick a bloodline first.'>
          {(control) => <TextInput {...control} placeholder='Homunculus' />}
        </Field>
        <Field label='Notes'>
          {(control) => (
            <TextArea {...control} placeholder='Placeholder text.' />
          )}
        </Field>
      </Section>
      <Section id='numeric'>
        <NumericInput label='Speed' defaultValue={30} min={0} step={5} />
        <NumericInput
          label='Clamped 0 to 10'
          value={clamped}
          min={0}
          max={10}
          onValueChange={(next) => setClamped(clampTen(next))}
        />
        <NumericInput label='Unbounded' defaultValue={null} />
        <ArkheProvider locale='fi' effects={false}>
          <NumericInput label='Suomeksi (fi)' defaultValue={1234.5} />
        </ArkheProvider>
      </Section>
      <Section id='chips'>
        {SPECIMEN_TONES.map((tone) => (
          <Chip key={tone} label={tone} tone={tone as ChipTone} />
        ))}
        <Chip label='with icon' icon='check' tone='accent' />
        {chips.map((chip) => (
          <Chip
            key={chip}
            label={chip}
            onRemove={() => setChips(chips.filter((other) => other !== chip))}
          />
        ))}
      </Section>
      <Section id='icons'>
        {SPECIMEN_ICONS.map((icon) => (
          <span key={icon} className='icon-cell'>
            <Icon name={icon} />
            <code>{icon}</code>
          </span>
        ))}
      </Section>
      <Section id='progress'>
        <div className='stack'>
          <Progress
            value={value}
            max={SPECIMEN_PROGRESS.max}
            markers={SPECIMEN_PROGRESS.markers}
            label='Budget'
            showValue
          />
          <div className='row'>
            <Button
              icon='minus'
              label='Less'
              onClick={() => setValue(value - 1)}
            />
            <Button
              icon='plus'
              label='More'
              onClick={() => setValue(value + 1)}
            />
          </div>
        </div>
      </Section>
      <SkeletonSection />
      <Section id='status'>
        <div className='stack'>
          <Status kind='empty' />
          <Status kind='loading' />
          <Status kind='error' />
          <Status kind='info'>Placeholder information.</Status>
        </div>
      </Section>
      <Section id='tabs'>
        <Tabs items={SPECIMEN_TABS} label='Sheet' panels={SPECIMEN_TAB_TEXT} />
      </Section>
      <Section id='modal'>
        <Modal
          title='Short rest'
          description='Spend recovery dice.'
          trigger='Open modal'>
          <NumericInput label='Dice' defaultValue={1} min={0} max={4} />
        </Modal>
        <Modal
          title='Discard changes?'
          role='alertdialog'
          trigger='Open confirmation'>
          <p>Unsaved edits are lost.</p>
        </Modal>
      </Section>
      <Section id='floating'>
        <p className='prose'>
          Hover <Tooltip content='Halves incoming damage.'>resistance</Tooltip>,
          read the{' '}
          <HoverCard
            title='Charge'
            content={
              <span>
                Spend one to take a second{' '}
                <HoverCard
                  title='Action'
                  content='One per turn, before moving.'>
                  action
                </HoverCard>
                .
              </span>
            }>
            charge
          </HoverCard>{' '}
          card, or open{' '}
          <HoverCard
            title='Fireball'
            load={loadSpecimenCard}
            loaded={(text) => <span>{text}</span>}>
            fireball
          </HoverCard>
          , which loads on first open.
        </p>
        <Popover trigger='Filters' title='Filter by'>
          <NumericInput label='Level' defaultValue={1} min={1} max={20} />
        </Popover>
        <Menu trigger='Actions' items={SPECIMEN_MENU} onSelect={setPicked} />
        <output>Picked: {picked}</output>
      </Section>
      <SelectSection />
    </main>
  );
};

/**
 * @fileoverview React clone of Ikuisuus's keyword cards, built from Arkhé's
 * HoverCard with Ikuisuus's timings, strings, card body and look. Cards
 * portal into the section's own layer, which carries the look.
 *
 * @module apps/showcase/src/react/IkuisuusSection
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import { ArkheEnvironment, HoverCard, Icon } from '@arkhe/react';
import { type JSX, type ReactNode, useState } from 'react';
import {
  IKUISUUS_DELAYS,
  IKUISUUS_KEYWORDS,
  ikuisuusString,
  type IkuisuusTerm,
  ikuisuusWidth,
} from '../ikuisuus';
import { SPECIMEN_SECTIONS } from '../specimen';

/**
 * One keyword of the clone: Arkhé's HoverCard with Ikuisuus's timings and card body.
 *
 * @component
 * @param {{ term: IkuisuusTerm, display?: string }} props - Keyword, and its text as written.
 * @returns {JSX.Element} Keyword and its card.
 */
const Keyword = ({
  term,
  display,
}: {
  readonly term: IkuisuusTerm;
  readonly display?: string;
}): JSX.Element => {
  const entry = IKUISUUS_KEYWORDS[term];
  return (
    <HoverCard
      title={entry.title}
      href={entry.href}
      headerLink={false}
      pinnable={false}
      placement='top'
      openDelay={IKUISUUS_DELAYS.open}
      closeDelay={IKUISUUS_DELAYS.close}
      width={ikuisuusWidth(entry.source)}
      content={<KeywordCard term={term} />}>
      {display ?? entry.display}
    </HoverCard>
  );
};

/**
 * Each keyword's card body, its shard prose.
 *
 * @constant BODIES
 * @type {Readonly<Record<IkuisuusTerm, () => ReactNode>>}
 */
const BODIES: Readonly<Record<IkuisuusTerm, () => ReactNode>> = {
  burning: () => (
    <>
      <p>Sufferers are on fire and take ongoing heat damage.</p>
      <ul>
        <li>
          At the start of each of their turns, sufferers take{' '}
          <strong>1d10 fire.</strong>
        </li>
        <li>
          Sufferers can use a <strong>Major Action</strong> to{' '}
          <strong>extinguish the flames</strong> by dropping prone, rolling, or
          smothering themselves.
          <ul>
            <li>
              Doing so{' '}
              <strong>
                automatically ends the{' '}
                <Keyword term='burning' display='burning' />
              </strong>
              , and they end their turn{' '}
              <strong>
                <Keyword term='prone' />.
              </strong>
            </li>
          </ul>
        </li>
        <li>
          Another creature within 1 stride may also use a{' '}
          <strong>Major Action</strong> to extinguish the flames.
        </li>
        <li>
          While burning, sufferers shed{' '}
          <strong>bright light in a 2-stride radius</strong> and{' '}
          <strong>dim light for another 2 strides.</strong>
        </li>
      </ul>
    </>
  ),
  prone: () => (
    <ul>
      <li>
        Sufferers’ only movement option is to <strong>crawl</strong>, unless
        they <strong>stand up</strong> and end the condition.
      </li>
      <li>
        They have <strong>disadvantage on attack rolls</strong>.
      </li>
      <li>
        <strong>Attack rolls</strong> against them have{' '}
        <strong>advantage</strong> if the attacker is within 1 stride;
        otherwise, those rolls have <strong>disadvantage</strong>.
      </li>
    </ul>
  ),
};

/**
 * The card body: title and rule link level with each other, then the prose.
 *
 * @component
 * @param {{ term: IkuisuusTerm }} props - Keyword.
 * @returns {JSX.Element} Card body.
 */
const KeywordCard = ({
  term,
}: {
  readonly term: IkuisuusTerm;
}): JSX.Element => {
  const entry = IKUISUUS_KEYWORDS[term];
  return (
    <div className='ik-card'>
      <div className='ik-card-heading'>
        <h3 className='ik-card-title'>{entry.title}</h3>
        <a
          className='ik-card-link'
          href={entry.href}
          aria-label={ikuisuusString('openRule', entry.title)}>
          <Icon name='external-link' />
        </a>
      </div>
      <div className='ik-blurb'>{BODIES[term]()}</div>
    </div>
  );
};

/**
 * Renders the Ikuisuus keyword clone: a feat line whose `Burning` keyword
 * opens a card holding two more keywords.
 *
 * @component
 * @returns {JSX.Element} Section.
 */
export const IkuisuusSection = (): JSX.Element => {
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  return (
    <section className='specimen ikuisuus' id='ikuisuus'>
      <h2>{SPECIMEN_SECTIONS.ikuisuus}</h2>
      <ArkheEnvironment container={layer ?? undefined}>
        <p className='prose'>
          <strong>Scorching Strike</strong>. The target takes an extra 1d6{' '}
          <strong>fire damage</strong>, and saves DEX or is affected by the{' '}
          <Keyword term='burning' /> condition.
        </p>
      </ArkheEnvironment>
      <div className='ikuisuus-layer' ref={setLayer} />
    </section>
  );
};

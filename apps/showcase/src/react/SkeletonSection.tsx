/**
 * @fileoverview React skeleton demo: three owners that load and reveal
 * together, plus one that keeps the CSS skeleton.
 *
 * @module apps/showcase/src/react/SkeletonSection
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { Button, Skeleton, SkeletonGroup, useArkhe } from '@arkhe/react';
import { useEffect, useState, type JSX } from 'react';
import {
  SPECIMEN_REVEAL,
  SPECIMEN_REVEAL_ROWS,
  SPECIMEN_SECTIONS,
} from '../specimen';
import { exposeEffects } from '../target';

/**
 * Renders the skeleton section.
 *
 * @component
 * @returns {JSX.Element} Section.
 */
export const SkeletonSection = (): JSX.Element => {
  const { effects } = useArkhe();
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(0);
  useEffect(() => exposeEffects(effects), [effects]);
  const count = () => setRevealed((n) => n + 1);
  return (
    <section className='specimen' id='skeleton'>
      <h2>{SPECIMEN_SECTIONS.skeleton}</h2>
      <div className='row'>
        <Button onClick={() => setLoading(!loading)}>
          {loading ? 'Load' : 'Reload'}
        </Button>
        <output>Revealed: {revealed}</output>
        <div className='reveal'>
          <div className='reveal-article'>
            <SkeletonGroup
              loading={loading}
              onRevealed={count}
              skeleton={
                <>
                  <Skeleton width='40%' height='1rem' />
                  <Skeleton />
                  <Skeleton width='95%' />
                  <Skeleton width='60%' />
                </>
              }>
              <h3>{SPECIMEN_REVEAL.title}</h3>
              <p>{SPECIMEN_REVEAL.text}</p>
            </SkeletonGroup>
          </div>
          <div className='reveal-card'>
            <SkeletonGroup
              loading={loading}
              onRevealed={count}
              skeleton={
                <>
                  <Skeleton width='30%' />
                  <Skeleton width='80%' />
                  <Skeleton shape='block' />
                </>
              }>
              <h3>{SPECIMEN_REVEAL.card}</h3>
              <p>{SPECIMEN_REVEAL.cardText}</p>
            </SkeletonGroup>
          </div>
          <SkeletonGroup
            loading={loading}
            onRevealed={count}
            skeleton={SPECIMEN_REVEAL_ROWS.map(([name]) => (
              <div className='reveal-row' key={name}>
                <Skeleton width='70%' />
                <Skeleton width='50%' />
                <Skeleton width='40%' />
              </div>
            ))}>
            <div className='reveal-list'>
              {SPECIMEN_REVEAL_ROWS.map(([name, kind, weight]) => (
                <div className='reveal-row' key={name}>
                  <span>{name}</span>
                  <span>{kind}</span>
                  <span>{weight}</span>
                </div>
              ))}
            </div>
          </SkeletonGroup>
          <SkeletonGroup
            loading={loading}
            effect={false}
            skeleton={<Skeleton width='50%' />}>
            <p>Plain CSS skeleton, no canvas.</p>
          </SkeletonGroup>
        </div>
      </div>
    </section>
  );
};

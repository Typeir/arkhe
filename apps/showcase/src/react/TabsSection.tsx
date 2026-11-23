/**
 * @fileoverview React specimen section for tabs: line tabs, and folder tabs
 * with many tabs, nested three deep.
 *
 * @module apps/showcase/src/react/TabsSection
 * @version 1.0.0
 * @author Typeir
 * @since 0.4.0
 */

import type { JSX } from 'react';
import { Tabs } from '@arkhe/react';
import {
  nestsFolder,
  SPECIMEN_FOLDERS,
  SPECIMEN_SECTIONS,
  SPECIMEN_TAB_TEXT,
  SPECIMEN_TABS,
} from '../specimen';

/**
 * Folder tabs at `depth`, holding the next level in their first tab.
 *
 * @component
 * @param {{ depth: number }} props - Level, from 0.
 * @returns {JSX.Element} Folder tabs.
 */
const Folder = ({ depth }: { readonly depth: number }): JSX.Element => (
  <Tabs
    look='folder'
    items={SPECIMEN_FOLDERS[depth] ?? []}
    label={`Folder level ${depth + 1}`}
    panels={(value) =>
      nestsFolder(depth, value) ? (
        <Folder depth={depth + 1} />
      ) : (
        <p>Contents of {value}.</p>
      )
    }
  />
);

/**
 * Renders line tabs and nested folder tabs.
 *
 * @component
 * @returns {JSX.Element} Section.
 */
export const TabsSection = (): JSX.Element => (
  <section className='specimen' id='tabs'>
    <h2>{SPECIMEN_SECTIONS.tabs}</h2>
    <div className='stack'>
      <Tabs items={SPECIMEN_TABS} label='Sheet' panels={SPECIMEN_TAB_TEXT} />
      <Folder depth={0} />
    </div>
  </section>
);

/**
 * @fileoverview React target entry.
 *
 * @module apps/showcase/src/react/main
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import '@arkhe/core/styles/arkhe.scss';
import '../showcase.scss';
import { ArkheProvider } from '@arkhe/react';
import { createRoot } from 'react-dom/client';
import { bootTarget, effectsFromQuery } from '../target';
import { Specimen } from './Specimen';

bootTarget();
createRoot(document.getElementById('app') as HTMLElement).render(
  <ArkheProvider effects={effectsFromQuery(location.search)}>
    <Specimen />
  </ArkheProvider>,
);

/**
 * @fileoverview Static target entry: the React specimen rendered to plain
 * markup with no event handlers, to show the stylesheet working without any
 * framework attached.
 *
 * @module apps/showcase/src/static/main
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import '@arkhe/core/styles/arkhe.scss';
import '../showcase.scss';
import { ArkheProvider } from '@arkhe/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Specimen } from '../react/Specimen';
import { bootTarget } from '../target';

bootTarget();
(document.getElementById('app') as HTMLElement).innerHTML =
  renderToStaticMarkup(
    <ArkheProvider>
      <Specimen />
    </ArkheProvider>,
  );

/**
 * @fileoverview Landing entry: styles, then the frames and switches.
 *
 * @module apps/showcase/src/landing/main
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import '@arkhe/core/styles/arkhe.scss';
import '../showcase.scss';
import { startLanding } from './landing';

startLanding(
  document.getElementById('stage') as HTMLElement,
  document.getElementById('controls') as HTMLElement,
);

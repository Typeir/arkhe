/**
 * @fileoverview Svelte target entry.
 *
 * @module apps/showcase/src/svelte/main
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import '@arkhe/core/styles/arkhe.scss';
import '../showcase.scss';
import { mount } from 'svelte';
import { bootTarget } from '../target';
import Specimen from './Specimen.svelte';

bootTarget();
mount(Specimen, { target: document.getElementById('app') as HTMLElement });

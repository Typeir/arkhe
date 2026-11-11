/**
 * @fileoverview Svelte test setup: jest-dom matchers, unmount between tests.
 *
 * @module tests/setup/svelte
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import '@testing-library/jest-dom/vitest';
import './quiet';
import './resizeObserver';
import './scrollTo';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

afterEach(cleanup);

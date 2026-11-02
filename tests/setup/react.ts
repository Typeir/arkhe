/**
 * @fileoverview React test setup: jest-dom matchers, unmount between tests.
 *
 * @module tests/setup/react
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import '@testing-library/jest-dom/vitest';
import './quiet';
import './resizeObserver';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

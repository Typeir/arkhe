/**
 * @fileoverview Default icon set: Lucide's glyph for every icon Arkhé's own
 * components draw. App art registered through `ArkheProvider` wins over it.
 *
 * @module packages/react/src/lucideIcons
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import type { ArkheIconName } from '@arkhe/core';
import {
  Check,
  ChevronDown,
  ExternalLink,
  Inbox,
  Info,
  Loader,
  Minus,
  Pin,
  PinOff,
  Plus,
  TriangleAlert,
  X,
} from 'lucide-react';
import type { IconComponent } from './ArkheProvider.js';

/**
 * Lucide glyphs by Lucide name, for Arkhé's own icons.
 *
 * @constant LUCIDE_ICONS
 * @type {Readonly<Record<ArkheIconName, IconComponent>>}
 */
export const LUCIDE_ICONS: Readonly<Record<ArkheIconName, IconComponent>> = {
  x: X,
  check: Check,
  plus: Plus,
  minus: Minus,
  'chevron-down': ChevronDown,
  loader: Loader,
  inbox: Inbox,
  'triangle-alert': TriangleAlert,
  info: Info,
  pin: Pin,
  'pin-off': PinOff,
  'external-link': ExternalLink,
};

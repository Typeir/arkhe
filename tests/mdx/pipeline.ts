/**
 * @fileoverview A watered-down copy of the app's MDX pipeline: `evaluate`
 * with the React JSX runtime and the two inline remark plugins. The app
 * evaluates the same way inside a React Server Component; here the result
 * is server-rendered with `react-dom/server` and hydrated in jsdom.
 *
 * @module tests/mdx/pipeline
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { evaluate } from '@mdx-js/mdx';
import type { MDXContent } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import { remarkKeyword, remarkUnit } from './remark';

/**
 * Compiles and runs an MDX source.
 *
 * @function compileMdx
 * @param {string} source - MDX text.
 * @returns {Promise<MDXContent>} The content component; pass it `components`.
 */
export async function compileMdx(source: string): Promise<MDXContent> {
  const module = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkUnit, remarkKeyword],
  });
  return module.default;
}

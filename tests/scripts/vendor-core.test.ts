import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  rewriteCoreImports,
  vendorCore,
} from '../../.github/scripts/vendor-core.mjs';

const roots: string[] = [];

const scratch = () => {
  const root = mkdtempSync(join(tmpdir(), 'arkhé-vendor-'));
  roots.push(root);
  return root;
};

const put = (path: string, text: string) => {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, text);
};

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('rewriteCoreImports', () => {
  it('points core and core/fx at the vendored copy, relative to the file', () => {
    const core = join('/r', 'dist', 'core');
    expect(
      rewriteCoreImports(
        `import { a } from '@arkhe/core';\nconst fx = import("@arkhe/core/fx");`,
        join('/r', 'dist'),
        core,
      ),
    ).toBe(
      `import { a } from './core/index.js';\nconst fx = import("./core/fx/index.js");`,
    );
    expect(
      rewriteCoreImports(`from '@arkhe/core'`, join('/r', 'dist', 'sub'), core),
    ).toBe(`from '../core/index.js'`);
  });

  it('leaves other specifiers alone', () => {
    const text = `import '@arkhe/core/arkhe.css'; import x from '@arkhe/corex';`;
    expect(rewriteCoreImports(text, '/r/dist', '/r/dist/core')).toBe(text);
  });
});

describe('vendorCore', () => {
  it('copies core in, rewrites imports and makes the manifest stand alone', () => {
    const root = scratch();
    const core = join(root, 'core');
    put(join(core, 'dist', 'index.js'), 'export const a = 1;');
    put(join(core, 'dist', 'arkhe.css'), '.arkhe{}');
    put(join(core, 'styles', '_tokens.scss'), '');
    const tree = join(root, 'port');
    put(join(tree, 'dist', 'Button.js'), `import { a } from '@arkhe/core';`);
    put(join(tree, 'dist', 'Plain.js'), `export const b = 2;`);
    put(
      join(tree, 'package.json'),
      JSON.stringify({
        name: '@arkhe/react',
        sideEffects: false,
        exports: { '.': './dist/index.js' },
        dependencies: { '@arkhe/core': '0.1.0', react: '19.3.1' },
      }),
    );
    expect(vendorCore(tree, core)).toBe(1);
    expect(readFileSync(join(tree, 'dist', 'Button.js'), 'utf8')).toBe(
      `import { a } from './core/index.js';`,
    );
    expect(readFileSync(join(tree, 'dist', 'core', 'arkhe.css'), 'utf8')).toBe(
      '.arkhe{}',
    );
    const pkg = JSON.parse(readFileSync(join(tree, 'package.json'), 'utf8'));
    expect(pkg.dependencies).toEqual({ react: '19.3.1' });
    expect(pkg.sideEffects).toEqual(['*.css', '*.scss']);
    expect(pkg.exports['./arkhe.css']).toBe('./dist/core/arkhe.css');
    expect(pkg.exports['./styles/*']).toBe('./dist/core/styles/*');
  });
});

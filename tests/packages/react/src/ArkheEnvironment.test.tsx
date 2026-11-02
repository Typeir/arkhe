import {
  ArkheEnvironment,
  useArkheEnvironment,
  type ArkheEnvironmentProps,
} from '@arkhe/react';
import type { ArkheEnvironmentValue } from '@arkhe/core';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const Probe = ({
  onRead,
}: {
  onRead: (value: ArkheEnvironmentValue) => void;
}) => {
  onRead(useArkheEnvironment());
  return null;
};

function capture(
  props?: Omit<ArkheEnvironmentProps, 'children'>,
): ArkheEnvironmentValue {
  const seen: { value?: ArkheEnvironmentValue } = {};
  const probe = <Probe onRead={(value) => (seen.value = value)} />;
  render(
    props ? <ArkheEnvironment {...props}>{probe}</ArkheEnvironment> : probe,
  );
  return seen.value as ArkheEnvironmentValue;
}

describe('ArkheEnvironment', () => {
  it('defaults to the main document', () => {
    const env = capture();
    expect(env.getRootNode()).toBe(document);
    expect(env.container()).toBe(document.body);
  });

  it('publishes a root node and container', () => {
    const host = document.createElement('div');
    const shadow = host.attachShadow({ mode: 'open' });
    const box = document.createElement('div');
    const env = capture({ rootNode: () => shadow, container: box });
    expect(env.getRootNode()).toBe(shadow);
    expect(env.container()).toBe(box);
  });
});

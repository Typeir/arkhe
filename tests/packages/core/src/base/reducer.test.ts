import {
  accordionReduce,
  collapsibleReduce,
  dispatch,
  toggleReduce,
  type AccordionAction,
  type AccordionRules,
  type CollapsibleAction,
  type CollapsibleRules,
  type Reducer,
  type ToggleAction,
  type ToggleRules,
} from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

const TEMPLATE: readonly [
  Reducer<readonly string[], ToggleAction, ToggleRules>,
  Reducer<readonly string[], AccordionAction, AccordionRules>,
  Reducer<boolean, CollapsibleAction, CollapsibleRules>,
] = [toggleReduce, accordionReduce, collapsibleReduce];

describe('reducer template', () => {
  it('holds every component reducer to (state, action, rules) => state', () => {
    expect(TEMPLATE.every((reduce) => reduce.length === 3)).toBe(true);
  });
});

describe('dispatch', () => {
  it('commits a changed state', () => {
    const commit = vi.fn();
    dispatch(collapsibleReduce, false, { type: 'toggle' }, {}, commit);
    expect(commit).toHaveBeenCalledWith(true);
  });

  it('skips the commit when the reducer returns the same state', () => {
    const commit = vi.fn();
    dispatch(
      collapsibleReduce,
      false,
      { type: 'toggle' },
      { disabled: true },
      commit,
    );
    const none: readonly string[] = [];
    dispatch(toggleReduce, none, { type: 'clear' }, {}, commit);
    expect(commit).not.toHaveBeenCalled();
  });
});

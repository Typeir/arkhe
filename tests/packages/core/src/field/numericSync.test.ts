import {
  NumericSync,
  REACT_EVENTS,
  guardInputProps,
  type NumericMachineApi,
} from '@arkhe/core';
import { describe, expect, it, vi } from 'vitest';

function fakeApi(start = Number.NaN) {
  const state = { value: start };
  const api: NumericMachineApi = {
    get valueAsNumber() {
      return state.value;
    },
    setValue: vi.fn((value: number) => {
      state.value = value;
    }),
    clearValue: vi.fn(() => {
      state.value = Number.NaN;
    }),
  };
  return { state, api, sync: new NumericSync(() => api) };
}

describe('NumericSync', () => {
  it('applies a controlled value that differs from the draft', () => {
    const { api, sync } = fakeApi(1);
    sync.receive(5);
    expect(api.setValue).toHaveBeenCalledWith(5);
    sync.receive(null);
    expect(api.clearValue).toHaveBeenCalled();
  });

  it('does not echo its own apply back to the host', () => {
    const { api, sync } = fakeApi(1);
    const onValueChange = vi.fn();
    vi.mocked(api.setValue).mockImplementation(() =>
      sync.emit(5, onValueChange),
    );
    sync.receive(5);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('stays silent when Zag runs the send in a later microtask', async () => {
    const { state, api, sync } = fakeApi(1);
    const onValueChange = vi.fn();
    vi.mocked(api.setValue).mockImplementation((value: number) =>
      queueMicrotask(() => {
        state.value = value;
        sync.emit(value, onValueChange);
      }),
    );
    sync.receive(1);
    sync.focus();
    sync.emit(17, onValueChange);
    sync.receive(17);
    sync.receive(42);
    await Promise.resolve();
    await Promise.resolve();
    sync.receive(43);
    await Promise.resolve();
    await Promise.resolve();
    expect(onValueChange.mock.calls).toEqual([[17]]);
    expect(api.setValue).toHaveBeenLastCalledWith(43);
    expect(state.value).toBe(43);
  });

  it('reports user changes once the silence has passed', async () => {
    const { sync } = fakeApi(1);
    const onValueChange = vi.fn();
    sync.receive(5);
    await Promise.resolve();
    sync.emit(6, onValueChange);
    expect(onValueChange).toHaveBeenCalledWith(6);
  });

  it('holds the answer to its own change until blur', () => {
    const { state, api, sync } = fakeApi(1);
    sync.receive(1);
    sync.focus();
    state.value = 70;
    sync.emit(70, () => undefined);
    sync.receive(10);
    expect(api.setValue).not.toHaveBeenCalled();
    sync.blur();
    expect(api.setValue).toHaveBeenCalledWith(10);
  });

  it('applies outside changes at once, even while focused', () => {
    const { api, sync } = fakeApi(1);
    sync.receive(1);
    sync.focus();
    sync.receive(4);
    expect(api.setValue).toHaveBeenCalledWith(4);
  });

  it('commits clamped values', () => {
    const { sync } = fakeApi();
    const onValueCommit = vi.fn();
    sync.commit(710, onValueCommit, { max: 10 });
    sync.commit(Number.NaN, onValueCommit, { max: 10 });
    expect(onValueCommit.mock.calls).toEqual([[10], [null]]);
  });
});

describe('guardInputProps', () => {
  it('reports focus and blur after Zag', () => {
    const { sync } = fakeApi();
    const order: string[] = [];
    vi.spyOn(sync, 'focus').mockImplementation(() => order.push('sync'));
    const props = guardInputProps(
      { onFocus: () => order.push('zag') },
      {},
      sync,
      REACT_EVENTS,
    ) as { onFocus: (event: unknown) => void };
    props.onFocus({});
    expect(order).toEqual(['zag', 'sync']);
  });

  it('drops aria bounds that are not set', () => {
    const { sync } = fakeApi();
    const props = guardInputProps(
      { 'aria-valuemin': -9e15, 'aria-valuemax': 10 },
      { max: 10 },
      sync,
      REACT_EVENTS,
    );
    expect(props).not.toHaveProperty('aria-valuemin');
    expect(props).toHaveProperty('aria-valuemax', 10);
  });

  it('keeps Home and End as caret moves when unbounded', () => {
    const { sync } = fakeApi();
    const zag = vi.fn();
    const unbounded = guardInputProps(
      { onKeyDown: zag },
      {},
      sync,
      REACT_EVENTS,
    ) as { onKeyDown: (event: { key: string }) => void };
    unbounded.onKeyDown({ key: 'Home' });
    unbounded.onKeyDown({ key: 'End' });
    unbounded.onKeyDown({ key: 'ArrowUp' });
    expect(zag).toHaveBeenCalledOnce();
    const bounded = guardInputProps(
      { onKeyDown: zag },
      { min: 0, max: 9 },
      sync,
      REACT_EVENTS,
    ) as { onKeyDown: (event: { key: string }) => void };
    bounded.onKeyDown({ key: 'Home' });
    expect(zag).toHaveBeenCalledTimes(2);
  });
});

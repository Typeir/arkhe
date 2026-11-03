// @vitest-environment jsdom
import { stubCanvas } from '@tests/fixtures/canvas';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CanvasBudget } from '../../../../../packages/core/src/canvas/budget';
import {
  ManagedCanvas,
  TILE_ATTR,
} from '../../../../../packages/core/src/canvas/managed';

const holder = (visible = false) => ({
  asleep: false,
  visible,
  lastSeen: 0,
  evict: () => undefined,
});

const place = { top: 12, width: 99.5, height: 50 };

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe('ManagedCanvas', () => {
  it('takes its pixels from the budget and sits at the padding-box origin', () => {
    stubCanvas();
    const budget = new CanvasBudget(4, 10_000);
    const lost = vi.fn();
    const restored = vi.fn();
    const canvas = new ManagedCanvas(budget, holder(), { lost, restored });
    expect(canvas.allocate(document.body, 40, 20, place)).toBe(true);
    const el = document.querySelector('canvas') as HTMLCanvasElement;
    expect(el.hasAttribute(TILE_ATTR)).toBe(true);
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect([el.width, el.height]).toEqual([40, 20]);
    expect(el.style.top).toBe('12px');
    expect(el.style.width).toBe('99.5px');
    expect(budget.livePixels).toBe(800);
    el.dispatchEvent(new Event('contextlost'));
    el.dispatchEvent(new Event('contextrestored'));
    expect(lost).toHaveBeenCalledTimes(1);
    expect(restored).toHaveBeenCalledTimes(1);
    canvas.free();
    expect(canvas.live).toBe(false);
    expect(el.width).toBe(0);
    expect(el.isConnected).toBe(false);
    expect(budget.livePixels).toBe(0);
  });

  it('gets nothing when the budget refuses', () => {
    stubCanvas();
    const budget = new CanvasBudget(4, 100);
    const canvas = new ManagedCanvas(budget, holder(), {
      lost: () => undefined,
      restored: () => undefined,
    });
    expect(canvas.allocate(document.body, 40, 20, place)).toBe(false);
    expect(document.querySelector('canvas')).toBeNull();
  });

  it('gives the pixels back when no 2D context comes', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const budget = new CanvasBudget(4, 10_000);
    const canvas = new ManagedCanvas(budget, holder(), {
      lost: () => undefined,
      restored: () => undefined,
    });
    expect(canvas.allocate(document.body, 4, 4, place)).toBe(false);
    expect(budget.count).toBe(0);
    expect(document.querySelector('canvas')).toBeNull();
  });
});

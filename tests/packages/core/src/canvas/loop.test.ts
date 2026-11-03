import { describe, expect, it } from 'vitest';
import {
  FrameLoop,
  IDLE_BUDGET,
  WATCHDOG_TIERS,
} from '../../../../../packages/core/src/canvas/loop';

const fakeRaf = () => {
  let next: FrameRequestCallback | null = null;
  let id = 0;
  return {
    raf: (cb: FrameRequestCallback) => {
      next = cb;
      return ++id;
    },
    caf: () => {
      next = null;
    },
    step(t: number) {
      const cb = next;
      next = null;
      cb?.(t);
    },
    get pending() {
      return next !== null;
    },
  };
};

describe('FrameLoop', () => {
  it('runs while something animates and stops when nothing does', () => {
    const f = fakeRaf();
    const s = new FrameLoop(f.raf, f.caf, () => 0);
    let left = 3;
    s.add({ frame: () => --left > 0 });
    expect(f.pending).toBe(true);
    f.step(16);
    f.step(32);
    f.step(48);
    expect(s.frames).toBe(3);
    expect(f.pending).toBe(false);
    expect(s.running).toBe(false);
  });

  it('defers off-screen work once the frame budget is spent, and runs it later', () => {
    const f = fakeRaf();
    let clock = 0;
    const s = new FrameLoop(f.raf, f.caf, () => clock);
    const ran: string[] = [];
    s.add({
      frame: () => ((clock += IDLE_BUDGET + 1), ran.push('visible'), false),
    });
    s.add({ idle: true, frame: () => (ran.push('idle'), false) });
    f.step(16);
    expect(ran).toEqual(['visible']);
    expect(f.pending).toBe(true);
    f.step(32);
    expect(ran).toEqual(['visible', 'idle']);
    expect(f.pending).toBe(false);
  });

  it('keeps one loop for many surfaces', () => {
    const f = fakeRaf();
    const s = new FrameLoop(f.raf, f.caf, () => 0);
    const seen: number[] = [];
    s.add({ frame: (t) => (seen.push(t), t < 32) });
    s.add({ frame: (t) => (seen.push(t), false) });
    f.step(16);
    f.step(32);
    expect(seen).toEqual([16, 16, 32]);
    expect(f.pending).toBe(false);
  });

  it('restarts when a surface is added after it stopped', () => {
    const f = fakeRaf();
    const s = new FrameLoop(f.raf, f.caf, () => 0);
    s.add({ frame: () => false });
    f.step(16);
    expect(f.pending).toBe(false);
    s.add({ frame: () => false });
    expect(f.pending).toBe(true);
  });

  it('never queues two frames when a surface is added during a tick', () => {
    let queued = 0;
    let next: FrameRequestCallback | null = null;
    const s = new FrameLoop(
      (cb) => (queued++, (next = cb), queued),
      () => undefined,
      () => 0,
    );
    const late = { frame: () => false };
    s.add({ frame: () => (s.add(late), true) });
    const cb = next as FrameRequestCallback | null;
    queued = 0;
    cb?.(16);
    expect(queued).toBe(1);
  });

  it('caps the frame rate', () => {
    const f = fakeRaf();
    const s = new FrameLoop(f.raf, f.caf, () => 0);
    s.cap(30);
    let drawn = 0;
    s.add({ frame: () => (drawn++, true) });
    for (let t = 0; t <= 1000; t += 1000 / 60) f.step(t);
    expect(drawn).toBeGreaterThanOrEqual(29);
    expect(drawn).toBeLessThanOrEqual(32);
    s.cap(0);
    expect(s.minInterval).toBe(0);
  });

  it('lifts the cap until uncapUntil', () => {
    const f = fakeRaf();
    const s = new FrameLoop(f.raf, f.caf, () => 0);
    s.cap(30);
    s.uncapUntil = 500;
    let drawn = 0;
    s.add({ frame: () => (drawn++, true) });
    for (let t = 0; t < 500; t += 1000 / 60) f.step(t);
    expect(drawn).toBeGreaterThanOrEqual(29);
    drawn = 0;
    for (let t = 500; t < 1000; t += 1000 / 60) f.step(t);
    expect(drawn).toBeLessThanOrEqual(16);
  });

  it('calls onSlow only when frames clearly miss their budget', () => {
    const f = fakeRaf();
    const s = new FrameLoop(f.raf, f.caf, () => 0);
    let slow = 0;
    s.onSlow = () => slow++;
    s.add({ frame: () => true });
    for (let i = 0; i < 61; i++) f.step(i * 40);
    expect(slow).toBe(1);
    const g = fakeRaf();
    const ok = new FrameLoop(g.raf, g.caf, () => 0);
    ok.onSlow = () => slow++;
    ok.add({ frame: () => true });
    for (let i = 0; i < 61; i++) g.step(i * 16.7);
    expect(slow).toBe(1);
  });

  it('steps the rate down through the watchdog tiers, then holds', () => {
    const f = fakeRaf();
    const s = new FrameLoop(f.raf, f.caf, () => 0);
    s.cap(30);
    s.watchdog();
    s.add({ frame: () => true });
    let t = 0;
    for (let i = 0; i < 400; i++) f.step((t += 500));
    expect(WATCHDOG_TIERS).toEqual([15, 5]);
    expect(s.tier).toBe(2);
    expect(s.minInterval).toBe(1000 / 5);
  });

  it('clear cancels the pending frame', () => {
    const f = fakeRaf();
    const s = new FrameLoop(f.raf, f.caf, () => 0);
    s.add({ frame: () => true });
    s.clear();
    expect(s.running).toBe(false);
    expect(f.pending).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  CanvasBudget,
  type BudgetClient,
} from '../../../../../packages/core/src/canvas/budget';

const client = (
  budget: CanvasBudget,
  lastSeen: number,
  asleep = false,
  visible = false,
) => {
  const c: BudgetClient & { evicted: boolean } = {
    asleep,
    visible,
    lastSeen,
    evicted: false,
    evict() {
      c.evicted = true;
      budget.release(c);
    },
  };
  return c;
};

describe('CanvasBudget', () => {
  it('grants within budget and tracks peaks', () => {
    const budget = new CanvasBudget(3, 1000);
    expect(budget.grant(client(budget, 1), 400)).toBe(true);
    expect(budget.grant(client(budget, 2), 400)).toBe(true);
    expect(budget.count).toBe(2);
    expect(budget.peakPixels).toBe(800);
  });

  it('evicts sleeping holders before awake ones, oldest first', () => {
    const budget = new CanvasBudget(2, 10_000);
    const awakeOld = client(budget, 1);
    const asleepNew = client(budget, 5, true);
    budget.grant(awakeOld, 10);
    budget.grant(asleepNew, 10);
    expect(budget.grant(client(budget, 9), 10)).toBe(true);
    expect(asleepNew.evicted).toBe(true);
    expect(awakeOld.evicted).toBe(false);
  });

  it('evicts the least recently seen when all are awake', () => {
    const budget = new CanvasBudget(2, 10_000);
    const a = client(budget, 1);
    const b = client(budget, 2);
    budget.grant(a, 10);
    budget.grant(b, 10);
    budget.grant(client(budget, 3), 10);
    expect(a.evicted).toBe(true);
    expect(b.evicted).toBe(false);
  });

  it('evicts until the pixel budget fits', () => {
    const budget = new CanvasBudget(10, 1000);
    const a = client(budget, 1);
    const b = client(budget, 2);
    budget.grant(a, 500);
    budget.grant(b, 400);
    expect(budget.grant(client(budget, 3), 800)).toBe(true);
    expect(a.evicted && b.evicted).toBe(true);
    expect(budget.livePixels).toBe(800);
  });

  it('never evicts a visible holder; refuses an off-screen requester instead', () => {
    const budget = new CanvasBudget(2, 10_000);
    const a = client(budget, 1, false, true);
    const b = client(budget, 2, false, true);
    budget.grant(a, 10);
    budget.grant(b, 10);
    expect(budget.grant(client(budget, 3), 10)).toBe(false);
    expect(a.evicted || b.evicted).toBe(false);
  });

  it('grants a visible requester past the budget once nothing off screen is left', () => {
    const budget = new CanvasBudget(2, 10_000);
    const off = client(budget, 1);
    budget.grant(client(budget, 2, false, true), 10);
    budget.grant(off, 10);
    expect(budget.grant(client(budget, 3, false, true), 10)).toBe(true);
    expect(off.evicted).toBe(true);
    expect(budget.grant(client(budget, 4, false, true), 10)).toBe(true);
    expect(budget.count).toBe(3);
    expect(budget.over).toBe(true);
  });

  it('is not over budget at or under its limits', () => {
    const budget = new CanvasBudget(2, 100);
    budget.grant(client(budget, 1), 50);
    budget.grant(client(budget, 2), 50);
    expect(budget.over).toBe(false);
  });

  it('refuses a request larger than the whole budget', () => {
    const budget = new CanvasBudget(10, 1000);
    expect(budget.grant(client(budget, 1), 1001)).toBe(false);
    expect(budget.count).toBe(0);
  });

  it('never exceeds the count budget', () => {
    const budget = new CanvasBudget(4, 1e9);
    for (let i = 0; i < 50; i++)
      budget.grant(client(budget, i, i % 3 === 0), 10);
    expect(budget.count).toBe(4);
    expect(budget.peakCount).toBe(4);
  });

  it('restarts peaks from what is live', () => {
    const budget = new CanvasBudget(4, 1000);
    const a = client(budget, 1);
    budget.grant(a, 300);
    budget.grant(client(budget, 2), 300);
    budget.release(a);
    budget.resetPeaks();
    expect(budget.peakCount).toBe(1);
    expect(budget.peakPixels).toBe(300);
  });
});

import { describe, it, expect } from 'vitest';
import { calculateStreak, calculateBalances } from '../src/utils.js';

describe('calculateStreak', () => {
    // Helper to create date relative to now
    const now = new Date('2024-01-10T12:00:00Z');
    const day = 24 * 60 * 60 * 1000;

    it('returns 0 for empty completions', () => {
        expect(calculateStreak([], now, now)).toBe(0);
    });

    it('calculates current streak correctly (today completed)', () => {
        // Created 10 days ago (Jan 1)
        const createdAt = new Date(now - 10 * day);
        // Today is day 10
        // Completions: 10, 9, 8 (streak of 3)
        const completions = [10, 9, 8];
        expect(calculateStreak(completions, createdAt, now)).toBe(3);
    });

    it('calculates current streak correctly (yesterday completed)', () => {
        const createdAt = new Date(now - 10 * day);
        // Today is day 10. Completed 9, 8. (Streak 2, assumes today not done yet but streak maintained)
        const completions = [9, 8];
        expect(calculateStreak(completions, createdAt, now)).toBe(2);
    });

    it('resets streak if yesterday missed', () => {
        const createdAt = new Date(now - 10 * day);
        // Today 10. Completed 8, 7. (Missed 9)
        const completions = [8, 7];
        expect(calculateStreak(completions, createdAt, now)).toBe(0);
    });

    it('filters out future completions', () => {
        const createdAt = new Date(now - 10 * day);
        // Today 10. Completions 11 (future), 10, 9.
        const completions = [11, 10, 9];
        expect(calculateStreak(completions, createdAt, now)).toBe(2);
    });
});

describe('calculateBalances', () => {
    it('calculates simple split correctly', () => {
        const expenses = [
            {
                paid_by: 'Alice',
                amount: 100,
                split_between: ['Alice', 'Bob']
            }
        ];
        // Alice paid 100, split 2 ways (50 each).
        // Alice balance: +100 - 50 = +50
        // Bob balance: 0 - 50 = -50
        const balances = calculateBalances(expenses);
        expect(balances['Alice']).toBe(50);
        expect(balances['Bob']).toBe(-50);
    });

    it('calculates multi-expense split correctly', () => {
        const expenses = [
            {
                paid_by: 'Alice',
                amount: 100, // Alice +50, Bob -50
                split_between: ['Alice', 'Bob']
            },
            {
                paid_by: 'Bob',
                amount: 40, // Bob +20, Alice -20
                split_between: ['Alice', 'Bob']
            }
        ];
        // Net:
        // Alice: +50 - 20 = +30
        // Bob: -50 + 20 = -30
        const balances = calculateBalances(expenses);
        expect(balances['Alice']).toBe(30);
        expect(balances['Bob']).toBe(-30);
    });
});

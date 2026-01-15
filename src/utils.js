/**
 * Nexus System Utility Functions
 */

/**
 * Calculates the current streak for a habit.
 * @param {Array<number>} completions - Array of completion day indices.
 * @param {string|Date} createdAt - Creation date of the habit.
 * @param {Date} [now=new Date()] - Current date (optional, for testing).
 * @returns {number} The current streak in days.
 */
export function calculateStreak(completions, createdAt, now = new Date()) {
    if (!completions || !completions.length) return 0;

    // Determine "today" index relative to creation
    const createdDate = new Date(createdAt);
    const todayIdx = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    // 1. Filter out future dates and sort descending
    const sorted = [...completions].filter(c => c <= todayIdx).sort((a, b) => b - a);

    if (sorted.length === 0) return 0;

    // 2. Check if streak is alive (today or yesterday must be present)
    const latest = sorted[0];
    if (latest < todayIdx - 1) return 0;

    // 3. Count consecutive days
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] - 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

/**
 * Calculates balances from a list of expenses.
 * @param {Array<Object>} expenses - List of expense objects.
 * @returns {Object} Map of person -> balance (positive = owed, negative = owes).
 */
export function calculateBalances(expenses) {
    const balances = {};

    expenses.forEach(exp => {
        const perPerson = exp.amount / exp.split_between.length;

        // Add to payer's balance (they are owed this amount)
        if (!balances[exp.paid_by]) balances[exp.paid_by] = 0;
        balances[exp.paid_by] += exp.amount;

        // Subtract from each person's balance (they owe this amount)
        exp.split_between.forEach(person => {
            if (!balances[person]) balances[person] = 0;
            balances[person] -= perPerson;
        });
    });

    return balances;
}

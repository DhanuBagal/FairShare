import { toCents, toDollars } from './moneyHelper.js';

/**
 * Calculates the net balances of each group member and computes the simplified debt transactions (min-cash-flow algorithm).
 * 
 * @param {Array} members - Array of User objects in the group [{ _id, name, email, avatar }]
 * @param {Array} expenses - Array of Expense documents in the group
 * @param {Array} settlements - Array of Settlement documents in the group
 * @returns {Object} { netBalances: Array, simplifiedDebts: Array, totalGroupSpending: number }
 */
export const calculateGroupBalances = (members, expenses = [], settlements = []) => {
  // Map of userId string => net balance in integer cents
  // Positive = member is owed money (creditor)
  // Negative = member owes money (debtor)
  const netCentsMap = {};
  const userMap = {};

  // Initialize members balance map
  members.forEach(member => {
    const id = member._id.toString();
    netCentsMap[id] = 0;
    userMap[id] = {
      _id: member._id,
      name: member.name,
      email: member.email,
      avatar: member.avatar || null
    };
  });

  let totalGroupSpendingCents = 0;

  // Process all group expenses
  expenses.forEach(expense => {
    const totalCents = toCents(expense.totalAmount);
    totalGroupSpendingCents += totalCents;

    const paidById = expense.paidBy._id ? expense.paidBy._id.toString() : expense.paidBy.toString();

    // Creditor gets credit for total paid
    if (netCentsMap[paidById] !== undefined) {
      netCentsMap[paidById] += totalCents;
    }

    // Debtors get debited for their assigned portion
    expense.participants.forEach(participant => {
      const participantId = participant.user._id
        ? participant.user._id.toString()
        : participant.user.toString();

      const portionCents = toCents(participant.amount);

      if (netCentsMap[participantId] !== undefined) {
        netCentsMap[participantId] -= portionCents;
      }
    });
  });

  // Process all settlements (settlement increases payer net balance, decreases payee net balance)
  settlements.forEach(settle => {
    const payerId = settle.payer._id ? settle.payer._id.toString() : settle.payer.toString();
    const payeeId = settle.payee._id ? settle.payee._id.toString() : settle.payee.toString();
    const amountCents = toCents(settle.amount);

    if (netCentsMap[payerId] !== undefined) {
      netCentsMap[payerId] += amountCents;
    }
    if (netCentsMap[payeeId] !== undefined) {
      netCentsMap[payeeId] -= amountCents;
    }
  });

  // Build formatted net balances array
  const netBalances = members.map(member => {
    const id = member._id.toString();
    const netCents = netCentsMap[id] || 0;
    return {
      user: userMap[id],
      netBalance: toDollars(netCents)
    };
  });

  // --- MIN CASH FLOW DEBT SIMPLIFICATION ALGORITHM ---
  // Separate net debtors (< 0) and net creditors (> 0)
  const debtors = [];
  const creditors = [];

  Object.keys(netCentsMap).forEach(userId => {
    const net = netCentsMap[userId];
    if (net < 0) {
      debtors.push({ userId, netAmount: Math.abs(net) });
    } else if (net > 0) {
      creditors.push({ userId, netAmount: net });
    }
  });

  // Sort descending by amount to maximize settlement efficiency
  debtors.sort((a, b) => b.netAmount - a.netAmount);
  creditors.sort((a, b) => b.netAmount - a.netAmount);

  const simplifiedDebts = [];

  let i = 0; // index into debtors
  let j = 0; // index into creditors

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleCents = Math.min(debtor.netAmount, creditor.netAmount);

    if (settleCents > 0) {
      simplifiedDebts.push({
        from: userMap[debtor.userId],
        to: userMap[creditor.userId],
        amount: toDollars(settleCents)
      });
    }

    debtor.netAmount -= settleCents;
    creditor.netAmount -= settleCents;

    if (debtor.netAmount === 0) {
      i++;
    }
    if (creditor.netAmount === 0) {
      j++;
    }
  }

  return {
    netBalances,
    simplifiedDebts,
    totalGroupSpending: toDollars(totalGroupSpendingCents)
  };
};

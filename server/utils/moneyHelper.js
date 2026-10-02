/**
 * Helper utilities for accurate monetary calculations using cent integers
 * to avoid floating-point math issues.
 */

// Convert dollar amount (e.g. 10.50) to integer cents (1050)
export const toCents = (dollars) => {
  if (dollars === undefined || dollars === null || isNaN(dollars)) return 0;
  return Math.round(Number(dollars) * 100);
};

// Convert integer cents (1050) back to dollar number (10.50)
export const toDollars = (cents) => {
  return Math.round(cents) / 100;
};

/**
 * Splits a total dollar amount among participant ObjectIds according to splitType.
 * Handles round-off remainder (e.g. 1-cent discrepancy) by assigning remainder to payer/first user.
 * 
 * @param {number} totalAmount - Total expense amount in dollars
 * @param {string} splitType - 'equal' | 'exact' | 'percentage'
 * @param {Array} participantsInput - Array of { user: ObjectId, amount?: number, percentage?: number }
 * @param {string} paidById - ObjectId string of the user who paid
 * @returns {Array} Array of { user, amount, percentage } formatted with exact 2-decimal numbers
 */
export const calculateSplit = (totalAmount, splitType, participantsInput, paidById) => {
  const totalCents = toCents(totalAmount);
  if (totalCents <= 0) {
    throw new Error('Total amount must be greater than zero');
  }

  if (!participantsInput || participantsInput.length === 0) {
    throw new Error('At least one participant is required');
  }

  const count = participantsInput.length;
  let participants = [];

  if (splitType === 'equal') {
    const baseCents = Math.floor(totalCents / count);
    const remainderCents = totalCents - (baseCents * count);

    // Distribute remainder 1-cent increments starting with paidBy or first user
    participants = participantsInput.map((p, index) => {
      const pUserId = p.user._id ? p.user._id.toString() : p.user.toString();
      const pPaidById = paidById ? (paidById._id ? paidById._id.toString() : paidById.toString()) : null;

      // Assign extra cent if this is the payer or index < remainderCents
      let extra = 0;
      if (pPaidById && pUserId === pPaidById && remainderCents > 0) {
        extra = remainderCents; // Give all remaining cents to payer
      } else if (!pPaidById && index < remainderCents) {
        extra = 1;
      }

      const participantCents = baseCents + (pPaidById && pUserId === pPaidById ? remainderCents : (pPaidById ? 0 : extra));
      const pct = (participantCents / totalCents) * 100;

      return {
        user: p.user,
        amount: toDollars(participantCents),
        percentage: Math.round(pct * 100) / 100
      };
    });
  } else if (splitType === 'exact') {
    let sumCents = 0;
    participants = participantsInput.map(p => {
      const pCents = toCents(p.amount);
      sumCents += pCents;
      const pct = totalCents > 0 ? (pCents / totalCents) * 100 : 0;
      return {
        user: p.user,
        amount: toDollars(pCents),
        percentage: Math.round(pct * 100) / 100
      };
    });

    if (sumCents !== totalCents) {
      const diff = toDollars(Math.abs(totalCents - sumCents));
      throw new Error(`Sum of exact split amounts (₹${toDollars(sumCents)}) does not equal total expense (₹${toDollars(totalCents)}). Difference: ₹${diff}`);
    }
  } else if (splitType === 'percentage') {
    let sumPercentage = 0;
    let allocatedCents = 0;

    participantsInput.forEach(p => {
      sumPercentage += Number(p.percentage || 0);
    });

    if (Math.abs(sumPercentage - 100) > 0.01) {
      throw new Error(`Total percentage must equal 100%. Current total: ${sumPercentage}%`);
    }

    participants = participantsInput.map((p, index) => {
      let pCents = 0;
      if (index === count - 1) {
        // Last participant gets remaining cents to ensure total equals exact amount
        pCents = totalCents - allocatedCents;
      } else {
        pCents = Math.round((totalCents * Number(p.percentage)) / 100);
        allocatedCents += pCents;
      }

      return {
        user: p.user,
        amount: toDollars(pCents),
        percentage: Number(p.percentage)
      };
    });
  } else {
    throw new Error(`Invalid splitType: ${splitType}`);
  }

  return participants;
};

import { ReputationPoint, AccountReputationPoints } from "../types";

const factor10 = 10 ** 10;
const REPUTATION_HALVING_CYCLE = 7776000; // 90 days

const decay = (amount: bigint, cycle: number): bigint => {
  if (cycle > 8) {
    // short circuit for very old payouts
    // after two years (8 cycles) the biggest possible payout 1400 is yielding just 5 rep.
    return BigInt(0);
  }
  if (amount < 2) return amount;
  if (cycle < 1)
    return (
      amount -
      ((amount / BigInt(2)) * BigInt(Math.floor(cycle * factor10))) /
        BigInt(factor10)
    );
  return decay(amount / BigInt(2), cycle - 1);
};

const reputationForAccount = (reputationPoints: ReputationPoint[]) =>
  reputationPoints.reduce((rep, pay) => {
    const cycle =
      (Math.floor(Date.now() / 1000) - pay.timestamp) /
      REPUTATION_HALVING_CYCLE;
    const decayed = decay(BigInt(pay.amount), cycle);
    return rep + decayed;
  }, BigInt(0));

const reputationForAccounts = (accountsData: AccountReputationPoints[]) => {
  const reputationPerMember = accountsData.map((data) => ({
    ...data,
    reputation: reputationForAccount(data.points),
  }));
  return reputationPerMember.sort(
    (a, b) => Number(b.reputation) - Number(a.reputation)
  );
};

export {
  REPUTATION_HALVING_CYCLE,
  reputationForAccount,
  reputationForAccounts,
};

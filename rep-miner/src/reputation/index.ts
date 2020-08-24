import { AccountReputationPoints } from "../types";

const factor10 = 10 ** 10;
const REPUTATION_HALVING_CYCLE = 7776000; // 90 days

const repCyclesSinceDate = (ethTimestamp: number) =>
  (Math.floor(Date.now() / 1000) - ethTimestamp) / REPUTATION_HALVING_CYCLE;

const decay = (amount: bigint, cycle: number): bigint => {
  if (cycle > 7) {
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

const reputationForAccount = ({ account, points }: AccountReputationPoints) => {
  const repPointsWithDecay = points.map((point) => ({
    ...point,
    reputation: decay(
      BigInt(point.amount),
      repCyclesSinceDate(point.timestamp)
    ),
  }));
  return {
    account,
    reputation: repPointsWithDecay.reduce(
      (s, p) => s + p.reputation,
      BigInt(0)
    ),
    points: repPointsWithDecay,
  };
};

const reputationForAccounts = (accountsData: AccountReputationPoints[]) =>
  accountsData
    .map(reputationForAccount)
    .sort((a, b) => Number(b.reputation) - Number(a.reputation));

export {
  REPUTATION_HALVING_CYCLE,
  reputationForAccount,
  reputationForAccounts,
};

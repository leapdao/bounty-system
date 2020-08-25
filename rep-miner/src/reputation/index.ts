import { AccountReputationPoints } from "../types";

const factor18 = 10 ** 18;
const HOURS_TO_HALVE = 2160; // 90 days

const hoursSince = (ethTimestamp: number) =>
  Math.floor((Date.now() / 1000 - ethTimestamp) / 3600);

// the formula is `decayed = amount * 1/2 ** (hoursSince/2160)`
// using factor18 to handle BigInt arithmethic
const decay = (amount: bigint, ethTimestamp: number) => {
  const percentRemains = BigInt(
    Math.floor(
      0.5 ** (hoursSince(ethTimestamp) / HOURS_TO_HALVE) * factor18
    )
  );
  const result = (amount * percentRemains) / BigInt(factor18);
  return result < 0 ? BigInt(0) : result;
};

const reputationForAccount = ({ account, points }: AccountReputationPoints) => {
  const repPointsWithDecay = points.map((point) => ({
    ...point,
    reputation: decay(BigInt(point.amount), point.timestamp),
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
  reputationForAccount,
  reputationForAccounts,
};

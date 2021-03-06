export type ReputationPoint = {
  id: string;
  amount: string;
  reputation?: BigInt;
  timestamp: number;
};

export type AccountReputationPoints = {
  account: string;
  points: ReputationPoint[];
};

export type AccountReputation = {
  account: string;
  reputation: BigInt;
  points: ReputationPoint[];
};

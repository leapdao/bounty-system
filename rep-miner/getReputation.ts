type Payout = {
  amount: string;
  timestamp: number;
};

type Payee = {
  id: string;
  payouts: [Payout];
};

export type Reputation = {
  account: string;
  reputation: BigInt;
  payouts: [Payout];
};

const getPayees = () =>
  fetch(`https://api.thegraph.com/subgraphs/name/leapdao/leapdao-bounties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
          {
            payees(first: 40) {
              id
              payouts {
                amount
                timestamp
              }
            }
          }   
        `,
    }),
  })
    .then((response) => response.json())
    .then((response) => response.data.payees);

const factor = BigInt("1000000000000000000");
const factor10 = 10 ** 10;
const reputationCycle = 7776000; // 90 days

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

export default async (): Promise<Reputation[]> => {
  const payees = await getPayees();
  const reputation = payees.map(({ id, payouts }: Payee) => {
    const reputation = payouts.reduce((rep, pay) => {
      const cycle = (Date.now() / 1000 - pay.timestamp) / reputationCycle;
      const decayed = decay(BigInt(pay.amount), cycle) / factor;
      return rep + decayed;
    }, BigInt(0));
    return {
      account: id,
      reputation,
      payouts,
    };
  });
  return reputation.sort((a, b) => Number(b.reputation) - Number(a.reputation));
};

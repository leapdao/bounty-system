import { ReputationPoint, AccountReputationPoints } from "../types";

export default (): Promise<AccountReputationPoints[]> =>
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
                id
                amount
                timestamp
              }
            }
          }   
        `,
    }),
  })
    .then((response) => response.json())
    .then((response) => 
      response.data.payees.map((p: { id: string; payouts: ReputationPoint[] }) => ({ 
        account: p.id,
        points: p.payouts,
      }))
    );
# LeapDAO Bounty payout subgraph

Indexes payouts made both through BountyPayout contract and through PaymentSplitter.

## Quick start

[Follow the guide here to set yourself up for local development](https://thegraph.com/docs/quick-start#local-development)

Initial setup (once)

```sh
yarn global add @graphprotocol/graph-cli
graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
```

Deploy changes

```sh
yarn codegen
yarn build
yarn deploy
```

## GraphQL based API

Query URL: `https://api.thegraph.com/subgraphs/name/leapdao/leapdao-bounties`

Playground URL: https://thegraph.com/explorer/subgraph/leapdao/leapdao-bounties/

## Example requests

Payouts per address:

```graphql
{
  payee(id:"0x51bab87c42d384d1cd3056d52d97c84ddaa65fe4") {
    id
    payouts {
      id
      amount
      timestamp
    }
  }
}
```

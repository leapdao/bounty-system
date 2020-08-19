import { Payout as PayoutEvent } from "../generated/BountyPayout/BountyPayout"
import { Payout, Payee } from "../generated/schema"
import { SplitERC20Call } from "../generated/PaymentSplitter/PaymentSplitter"
import { BigInt, Bytes } from '@graphprotocol/graph-ts'

let payers = new Array<string>()
payers.push("0x27f083b6CE372a260f71305350f1e3e66Efdca34")
payers.push("0xc5cdcd5470aef35fc33bddff3f8ecec027f95b1d")
payers.push("0xb2fb8ce072830ec4b0fe2fc45bd86a2fda67a209")
payers.push("0x5270E80aFD2B244ae76da250d7D46805cbD212FA")
payers.push("0x755F5406032E91523f188Aeee618F121Fa86DB67")


function createPayout(payeeAddress: string, amount: BigInt, timestamp: BigInt, hash: Bytes): void {
  let payee = Payee.load(payeeAddress) || new Payee(payeeAddress)
  
  let payoutId = hash.toHex()
  let payout = new Payout(payoutId)
  payout.amount = amount
  payout.timestamp = timestamp
  payout.payee = payeeAddress
  payout.save()
  
  payee.save()
}

export function handlePayout(event: PayoutEvent): void {
  createPayout(
    event.params.recipient.toHex(),
    event.params.amount,
    event.block.timestamp,
    event.transaction.hash
  )
}

export function handleSplitDAI(call: SplitERC20Call): void {
  // count only splits coming from LeapDAO Safes
  if (!payers.includes(call.from.toHex())) return;

  // count only DAI splits
  if (call.inputs._tokenAddr.toHex() !== '0x6b175474e89094c44da98b954eedeac495271d0f') return;

  let payeeAddresses = call.inputs._recipients
  let payeeAmounts = call.inputs._splits
  for (let i = 0; i < call.inputs._recipients.length; i++) {
    createPayout(
      payeeAddresses[i].toHex(),
      payeeAmounts[i],
      call.block.timestamp,
      call.transaction.hash
    )
  }
}

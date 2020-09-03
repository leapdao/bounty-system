import { Payout as PayoutEvent } from "../generated/BountyPayout/BountyPayout"
import { Payout, Payee } from "../generated/schema"
import { SplitERC20Call } from "../generated/PaymentSplitter/PaymentSplitter"
import { BigInt, Bytes } from '@graphprotocol/graph-ts'

let payers = new Array<string>()
payers.push("0x27f083b6ce372a260f71305350f1e3e66efdca34") // General Escrow (Gnosis Safe)
payers.push("0xc5cdcd5470aef35fc33bddff3f8ecec027f95b1d") // StatusPay Discovery (Gnosis Multisig)
payers.push("0xb2fb8ce072830ec4b0fe2fc45bd86a2fda67a209") // WhiteRabbit (Safe)
payers.push("0x5270e80afd2b244ae76da250d7d46805cbd212fa") // EMO (Safe)
payers.push("0x755f5406032e91523f188aeee618f121fa86db67") // Nervos (Safe)


function createPayout(payeeAddress: string, amount: BigInt, source: string, timestamp: BigInt, hash: Bytes): void {
  let payee = Payee.load(payeeAddress) || new Payee(payeeAddress)
  
  let payout = new Payout(hash.toHex() + "-" + payeeAddress)
  payout.amount = amount
  payout.timestamp = timestamp
  payout.payee = payeeAddress
  payout.source = source
  payout.save()
  
  payee.save()
}

export function handlePayout(event: PayoutEvent): void {
  createPayout(
    event.params.recipient.toHex(),
    event.params.amount,
    event.transaction.from.toHex(),
    event.block.timestamp,
    event.transaction.hash
  )
}

export function handleSplitDAI(call: SplitERC20Call): void {
  // count only splits coming from LeapDAO Safes
  if (!payers.includes(call.from.toHex())) return

  // count only DAI splits
  let isDai = call.inputs._tokenAddr.toHex() == '0x6b175474e89094c44da98b954eedeac495271d0f';
  if (!isDai) return;

  let payeeAddresses = call.inputs._recipients
  let payeeAmounts = call.inputs._splits
  for (let i = 0; i < payeeAddresses.length; i++) {
    createPayout(
      payeeAddresses[i].toHex(),
      payeeAmounts[i],
      call.from.toHex(),
      call.block.timestamp,
      call.transaction.hash
    )
  }
}

/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License, version 2,
 * found in the LICENSE file in the root directory of this source tree.
 */
import bre, { ethers } from "@nomiclabs/buidler";
import { ContractFactory, Signer } from "ethers";
import { assert } from 'chai';

const deploy = async (contractFactory: ContractFactory, ...args: any[]) => {
  const contract = await contractFactory.deploy(...args);
  return contract.deployed();
};

describe('BountyPayout', () => {

  const amount = '100000000000000000000'; // 100 dai
  let dai: any;
  let bountyPayout: any;

  let accounts: string[]; 
  
  let leap: { address: string };

  let ERC20Mock: ContractFactory;
  let BountyPayout: ContractFactory;
  let SafeMock: ContractFactory;

  before(async () => {
    accounts = await Promise.all((await bre.ethers.getSigners()).map(a => a.getAddress()));
    leap = { address: accounts[3] };
    ERC20Mock = await bre.ethers.getContractFactory("ERC20Mock");
    BountyPayout = await bre.ethers.getContractFactory("BountyPayout");
    SafeMock = await bre.ethers.getContractFactory("SafeMock");
  })

  beforeEach(async () => {
    dai = await deploy(ERC20Mock, 'DAI', 'dai');
    await dai.mint(accounts[0], amount);
    bountyPayout = await deploy(BountyPayout, dai.address, leap.address);
    await bountyPayout.grantRole(bountyPayout.USER_ROLE.call(), accounts[0]);

    await dai.approve(bountyPayout.address, amount);
  });

  it('is payable', async () => {
    await bountyPayout.payout(
      `0x${accounts[1].replace('0x', '')}00000000D02AB486CEDC0000`, // 15%
      `0x${accounts[2].replace('0x', '')}00000003860E639D80640000`, // 65%
      `0x${accounts[3].replace('0x', '')}00000001158E460913D00000`, // 20%
      '0x2f6c6561702d636f6e7472616374732f6973737565732f323337111123312553' // /leap-contracts/issues/237
    );
    assert.equal((await dai.balanceOf(accounts[1])).toString(), '15000000000000000000');
    assert.equal((await dai.balanceOf(accounts[2])).toString(), '65000000000000000000');
    assert.equal((await dai.balanceOf(accounts[3])).toString(), '20000000000000000000');
  });

  it('is payable with gas refund', async () => {
    const safe = await deploy(SafeMock, dai.address, bountyPayout.address);
    await dai.transfer(safe.address, amount);
    await (await bre.ethers.getSigners())[0].sendTransaction({
      to: safe.address,
      value: bre.ethers.BigNumber.from('1000000000000000000').toHexString()
    });
    await safe.approve(bountyPayout.address, amount);
    await bountyPayout.grantRole(bountyPayout.USER_ROLE.call(), safe.address);
    const balBefore = await bre.ethers.provider.getBalance(accounts[0]);
    await safe.payout(
      `0x${accounts[1].replace('0x', '')}00000000D02AB486CEDC0000`, // 15%
      `0x${accounts[2].replace('0x', '')}00000003860E639D80640000`, // 65%
      `0x${accounts[3].replace('0x', '')}00000001158E460913D00000`, // 20%
      '0x2f6c6561702d636f6e7472616374732f6973737565732f323337111123312553' // /leap-contracts/issues/237
    );
    assert.equal((await dai.balanceOf(accounts[1])).toString(), '15000000000000000000');
    assert.equal((await dai.balanceOf(accounts[2])).toString(), '65000000000000000000');
    assert.equal((await dai.balanceOf(accounts[3])).toString(), '20000000000000000000');
    const balAfter = await bre.ethers.provider.getBalance(accounts[0]);
    assert(bre.ethers.BigNumber.from(balAfter).gte(bre.ethers.BigNumber.from(balBefore)));
    assert.equal((await bre.ethers.provider.getBalance(bountyPayout.address)).toString(), '0');
  });

  it('is payable with rep only', async () => {
    await bountyPayout.payoutNoReviewer(
      `0x${accounts[1].replace('0x', '')}00000000D02AB486CEDC0000`, // 15%
      `0x${accounts[2].replace('0x', '')}00000003860E639D80640001`, // 65% repOnly
      '0x2f6c6561702d636f6e7472616374732f6973737565732f323337111123312553' // /leap-contracts/issues/237
    );
    assert.equal((await dai.balanceOf(accounts[1])).toString(), '15000000000000000000');
    assert.equal((await dai.balanceOf(accounts[2])).toString(), '0');
  });

  it('is payable for delivery with review', async () => {
    await bountyPayout.payoutReviewedDelivery(
      `0x${accounts[1].replace('0x', '')}00000000D02AB486CEDC0000`, // 15%
      `0x${accounts[2].replace('0x', '')}00000003860E639D80640000`, // 65% repOnly
      '0x2f6c6561702d636f6e7472616374732f6973737565732f323337111123312553' // /leap-contracts/issues/237
    );
    assert.equal((await dai.balanceOf(accounts[1])).toString(), '15000000000000000000');
    assert.equal((await dai.balanceOf(accounts[2])).toString(), '65000000000000000000');
  });

});
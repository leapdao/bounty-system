#!/usr/bin/env node

const ethers = require("ethers");

const printUsageAndExit = () => {
  console.log("Usage:");
  console.log("\tnpx @leapdao/split-tx decode <message data>");
  console.log("\tnpx @leapdao/split-tx encode <address 1> <value 1> [<address 2> <value 2> ...] [<token address>]");
  console.log("\nIf token address is not specified, DAI token will be used");
  process.exit(0);
};

if (process.argv.length < 3) {
  return printUsageAndExit();
}

const action = process.argv[2];

const SplitterABI = [
  {
    constant: false,
    inputs: [
      { name: "_recipients", type: "address[]" },
      { name: "_splits", type: "uint256[]" },
      { name: "_tokenAddr", type: "address" },
    ],
    name: "splitERC20",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const splitter = new ethers.utils.Interface(SplitterABI);
const splitERC20 = splitter.getFunction("splitERC20");

const printDecoded = (data) => {
  console.log('\nToken to split:', data[2]);
  console.log("split:");
  for (let i = 0; i < data[0].length; i++) {
    console.log(
      `\t${ethers.utils.formatEther(data[1][i])} → ${data[0][i]}`
    );
  }
  console.log(
    "\nTotal:",
    ethers.utils.formatEther(
      data[1].reduce((s, v) => s.add(ethers.BigNumber.from(v)), ethers.BigNumber.from(0))
    )
  );
}

if (action === "decode") {
  const data = splitter.decodeFunctionData(splitERC20, process.argv[3]);
  printDecoded(data);
} else if (action === "encode") {
  const args = process.argv.slice(3);
  const data = args.slice(0, args.length - args.length % 2).reduce((s, v, i) => { s[i % 2].push(v); return s }, [[], []]);
  data[1] = data[1].map(v => ethers.utils.parseUnits(v).toString());
  const maybeToken = process.argv.slice(-1)[0];
  data[2] = /0x[\w\W\d]{40}/.test(maybeToken) ? maybeToken : "0x6b175474e89094c44da98b954eedeac495271d0f";
  printDecoded(data);
  console.log('\nMessage data for splitERC20 call:');
  console.log(splitter.encodeFunctionData(splitERC20, data));
} else {
  console.log("Unknown command: ", action, "\n");
  printUsageAndExit();
}

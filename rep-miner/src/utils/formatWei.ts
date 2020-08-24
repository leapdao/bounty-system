const factor18 = BigInt('1000000000000000000');

export default (wei: BigInt | string): string =>
  (BigInt(wei) / factor18).toString();

import {
  reputationForAccount,
  reputationForAccounts,
  REPUTATION_HALVING_CYCLE,
} from "./index";
import { AccountReputationPoints } from "../types";

const NOW = Date.now();
const t90daysAgo = Math.floor(NOW / 1000) - REPUTATION_HALVING_CYCLE;
const t45daysAgo = Math.floor(NOW / 1000) - REPUTATION_HALVING_CYCLE / 2;

beforeAll(() => {
  jest.spyOn(Date, "now").mockImplementation(() => NOW);
});

afterAll(() => {
  (Date.now as any).mockRestore();
});

describe("#reputationForAccount", () => {
  test("decay 1 hour", () => {
    const points = [
      {
        amount: "262000000000000000000",
        timestamp: Math.floor(NOW / 1000) - REPUTATION_HALVING_CYCLE / 90 / 24,
      },
    ];
    expect(reputationForAccount(points)).toEqual(
      BigInt("261939351860100000000")
    );
  });

  test("decay 45 days", () => {
    const points = [
      {
        amount: "262000000000000000000",
        timestamp: t45daysAgo,
      },
    ];
    expect(reputationForAccount(points)).toEqual(
      BigInt("196500000000000000000")
    );
  });

  test("decay 90 days", () => {
    const points = [
      {
        amount: "262000000000000000000",
        timestamp: t90daysAgo,
      },
    ];
    expect(reputationForAccount(points)).toEqual(
      BigInt("131000000000000000000")
    );
  });

  test("decay 180 days", () => {
    const points = [
      {
        amount: "262000000000000000000",
        timestamp: Math.floor(NOW / 1000) - REPUTATION_HALVING_CYCLE * 2,
      },
    ];
    expect(reputationForAccount(points)).toEqual(
      BigInt("65500000000000000000")
    );
  });

  test("decay 720 days", () => {
    const points = [
      {
        amount: "1400000000000000000000",
        timestamp: Math.floor(NOW / 1000) - REPUTATION_HALVING_CYCLE * 8,
      },
    ];
    expect(reputationForAccount(points)).toEqual(
      BigInt("0")
    );
  });

  test("sums up all the reputation points with decay", () => {
    const points = [
      {
        amount: "262000000000000000000",
        timestamp: t90daysAgo,
      },
      {
        amount: "300000000000000000000",
        timestamp: t45daysAgo,
      },
    ];
    expect(reputationForAccount(points)).toEqual(
      BigInt("356000000000000000000")
    );
  });
});

describe("#reputationForAccounts", () => {
  test("happy case", () => {
    const accounts: AccountReputationPoints[] = [
      {
        account: "0x111",
        points: [{ amount: "262000000000000000000", timestamp: t90daysAgo }],
      },
      {
        account: "0x222",
        points: [{ amount: "300000000000000000000", timestamp: t45daysAgo }],
      },
    ];
    expect(reputationForAccounts(accounts)).toEqual([
      {
        ...accounts[1],
        reputation: BigInt("225000000000000000000"),
      },
      {
        ...accounts[0],
        reputation: BigInt("131000000000000000000"),
      },
    ]);
  });
});

import { reputationForAccount, reputationForAccounts } from "./index";
import { AccountReputationPoints, ReputationPoint } from "../types";

const NOW = Date.now();
const t90daysAgo = Math.floor(NOW / 1000) - 3600 * 24 * 90;
const t45daysAgo = Math.floor(NOW / 1000) - 3600 * 24 * 45;

beforeAll(() => {
  jest.spyOn(Date, "now").mockImplementation(() => NOW);
});

afterAll(() => {
  (Date.now as any).mockRestore();
});

const account = (points: ReputationPoint[]) => ({
  account: "0x123",
  points,
});

describe("#reputationForAccount", () => {
  test("decay 1 hour", () => {
    const points = [
      {
        id: "0x1-0x2",
        amount: "262000000000000000000",
        timestamp: Math.floor(NOW / 1000) - 3600,
      },
    ];
    expect(reputationForAccount(account(points))).toEqual({
      account: "0x123",
      reputation: BigInt("261939351860100000000"),
      points: [
        {
          ...points[0],
          reputation: BigInt("261939351860100000000"),
        },
      ],
    });
  });

  test("decay 45 days", () => {
    const points = [
      {
        id: "0x1-0x2",
        amount: "262000000000000000000",
        timestamp: t45daysAgo,
      },
    ];
    expect(reputationForAccount(account(points))).toEqual({
      account: "0x123",
      reputation: BigInt("196500000000000000000"),
      points: [
        {
          ...points[0],
          reputation: BigInt("196500000000000000000"),
        },
      ],
    });
  });

  test("decay 90 days", () => {
    const points = [
      {
        id: "0x1-0x2",
        amount: "262000000000000000000",
        timestamp: t90daysAgo,
      },
    ];
    expect(reputationForAccount(account(points))).toEqual({
      account: "0x123",
      reputation: BigInt("131000000000000000000"),
      points: [
        {
          ...points[0],
          reputation: BigInt("131000000000000000000"),
        },
      ],
    });
  });

  test("decay 180 days", () => {
    const points = [
      {
        id: "0x1-0x2",
        amount: "262000000000000000000",
        timestamp: Math.floor(NOW / 1000) - 3600 * 24 * 180,
      },
    ];
    expect(reputationForAccount(account(points))).toEqual({
      account: "0x123",
      reputation: BigInt("65500000000000000000"),
      points: [
        {
          ...points[0],
          reputation: BigInt("65500000000000000000"),
        },
      ],
    });
  });

  test("decay 720 days and older — returns 0 right away", () => {
    const points = [
      {
        id: "0x1-0x2",
        amount: "1400000000000000000000",
        timestamp: Math.floor(NOW / 1000) - 3600 * 24 * 720,
      },
    ];
    expect(reputationForAccount(account(points))).toEqual({
      account: "0x123",
      reputation: BigInt("0"),
      points: [
        {
          ...points[0],
          reputation: BigInt("0"),
        },
      ],
    });
  });

  test("sums up all the reputation points with decay", () => {
    const points = [
      {
        id: "0x1-0x2",
        amount: "262000000000000000000",
        timestamp: t90daysAgo,
      },
      {
        id: "0x1-0x2",
        amount: "300000000000000000000",
        timestamp: t45daysAgo,
      },
    ];
    expect(reputationForAccount(account(points))).toEqual({
      account: "0x123",
      reputation: BigInt("356000000000000000000"),
      points: [
        {
          ...points[0],
          reputation: BigInt("131000000000000000000"),
        },
        {
          ...points[1],
          reputation: BigInt("225000000000000000000"),
        },
      ],
    });
  });
});

describe("#reputationForAccounts", () => {
  test("happy case", () => {
    const accounts: AccountReputationPoints[] = [
      {
        account: "0x111",
        points: [
          {
            id: "0x1-0x2",
            amount: "262000000000000000000",
            timestamp: t90daysAgo,
          },
        ],
      },
      {
        account: "0x222",
        points: [
          {
            id: "0x1-0x2",
            amount: "300000000000000000000",
            timestamp: t45daysAgo,
          },
        ],
      },
    ];
    expect(reputationForAccounts(accounts)).toEqual([
      {
        ...accounts[1],
        points: [
          {
            ...accounts[1].points[0],
            reputation: BigInt("225000000000000000000"),
          },
        ],
        reputation: BigInt("225000000000000000000"),
      },
      {
        ...accounts[0],
        points: [
          {
            ...accounts[0].points[0],
            reputation: BigInt("131000000000000000000"),
          },
        ],
        reputation: BigInt("131000000000000000000"),
      },
    ]);
  });
});

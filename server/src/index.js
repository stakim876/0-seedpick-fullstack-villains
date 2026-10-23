import cors from "cors";
import express from "express";
import {
  Account,
  START_CASH,
  Startup,
  connectDb,
  presentAccount,
  presentStartup,
} from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

// 기업 목록과 상세는 MongoDB에서 읽는다.
app.get("/api/startups", async (req, res) => {
  const list = await Startup.find().sort({ id: 1 });
  res.json(list.map(presentStartup));
});

app.get("/api/startups/:id", async (req, res) => {
  const startup = await Startup.findOne({ id: req.params.id });

  if (!startup) {
    res.status(404).json({ message: "기업을 찾을 수 없습니다." });
    return;
  }

  res.json(presentStartup(startup));
});

// 잔액, 보유, 주문 내역은 계좌 문서 하나에 둔다. 없으면 처음 금액으로 만든다.
app.get("/api/account", async (req, res) => {
  let account = await Account.findOne();

  if (!account) {
    account = await Account.create({ cash: START_CASH, holdings: [], orders: [] });
  }

  res.json(presentAccount(account));
});

app.put("/api/account", async (req, res) => {
  const { cash, holdings, orders } = req.body;

  if (typeof cash !== "number" || !Array.isArray(holdings) || !Array.isArray(orders)) {
    res.status(400).json({ message: "계좌 값이 올바르지 않습니다." });
    return;
  }

  const account = await Account.findOneAndUpdate(
    {},
    { cash, holdings, orders },
    { upsert: true, new: true },
  );

  res.json(presentAccount(account));
});

// 매수와 매도는 서버가 잔액과 보유를 계산한다.
app.post("/api/orders", async (req, res) => {
  const { startupId, side, quantity } = req.body;
  const shares = Number(quantity);

  if (side !== "buy" && side !== "sell") {
    res.status(400).json({ message: "매수 또는 매도를 선택하세요." });
    return;
  }

  if (!Number.isInteger(shares) || shares < 1) {
    res.status(400).json({ message: "수량을 입력하세요." });
    return;
  }

  let account = await Account.findOne();

  if (!account) {
    account = await Account.create({ cash: START_CASH, holdings: [], orders: [] });
  }

  const current = presentAccount(account);

  if (side === "buy") {
    const startup = await Startup.findOne({ id: String(startupId) });

    if (!startup) {
      res.status(404).json({ message: "기업을 찾을 수 없습니다." });
      return;
    }

    const cost = startup.price * shares;

    if (cost > current.cash) {
      res.status(400).json({ message: "주문 가능 금액이 부족합니다." });
      return;
    }

    const owned = current.holdings.find((item) => item.id === startup.id);
    const holdings = owned
      ? current.holdings.map((item) => {
          if (item.id !== startup.id) {
            return item;
          }

          const nextQuantity = item.quantity + shares;
          const averagePrice = (item.quantity * item.averagePrice + cost) / nextQuantity;

          return {
            ...item,
            quantity: nextQuantity,
            averagePrice,
            price: startup.price,
            value: nextQuantity * startup.price,
          };
        })
      : [
          ...current.holdings,
          {
            id: startup.id,
            name: startup.name,
            quantity: shares,
            averagePrice: startup.price,
            price: startup.price,
            value: cost,
          },
        ];

    const saved = await Account.findOneAndUpdate(
      {},
      {
        cash: current.cash - cost,
        holdings,
        orders: [
          {
            id: String(Date.now()),
            startupId: startup.id,
            name: startup.name,
            side: "buy",
            quantity: shares,
            price: startup.price,
            amount: cost,
            createdAt: new Date().toISOString(),
          },
          ...current.orders,
        ],
      },
      { new: true },
    );

    res.status(201).json(presentAccount(saved));
    return;
  }

  const holding = current.holdings.find((item) => item.id === String(startupId));

  if (!holding || shares > holding.quantity) {
    res.status(400).json({ message: "보유 수량보다 많습니다." });
    return;
  }

  const nextQuantity = holding.quantity - shares;
  const amount = holding.price * shares;
  const holdings =
    nextQuantity === 0
      ? current.holdings.filter((item) => item.id !== holding.id)
      : current.holdings.map((item) =>
          item.id === holding.id
            ? { ...item, quantity: nextQuantity, value: nextQuantity * item.price }
            : item,
        );

  const saved = await Account.findOneAndUpdate(
    {},
    {
      cash: current.cash + amount,
      holdings,
      orders: [
        {
          id: String(Date.now()),
          startupId: holding.id,
          name: holding.name,
          side: "sell",
          quantity: shares,
          price: holding.price,
          amount,
          createdAt: new Date().toISOString(),
        },
        ...current.orders,
      ],
    },
    { new: true },
  );

  res.status(201).json(presentAccount(saved));
});

connectDb()
  .then(() => {
    app.listen(4000, () => {
      console.log("http://localhost:4000");
    });
  })
  .catch((error) => {
    console.error("MongoDB에 연결하지 못했습니다.", error.message);
    process.exit(1);
  });

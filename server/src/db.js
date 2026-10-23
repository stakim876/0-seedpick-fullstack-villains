import mongoose from "mongoose";
import startups from "./startups.js";

export const START_CASH = 10000000;

const startupSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    industry: String,
    stage: String,
    region: String,
    price: Number,
    changeRate: Number,
  },
  { versionKey: false },
);

const holdingSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    quantity: Number,
    averagePrice: Number,
    price: Number,
    value: Number,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    id: String,
    startupId: String,
    name: String,
    side: String,
    quantity: Number,
    price: Number,
    amount: Number,
    createdAt: String,
  },
  { _id: false },
);

const accountSchema = new mongoose.Schema(
  {
    cash: { type: Number, default: START_CASH },
    holdings: { type: [holdingSchema], default: [] },
    orders: { type: [orderSchema], default: [] },
  },
  { versionKey: false },
);

export const Startup = mongoose.model("Startup", startupSchema);
export const Account = mongoose.model("Account", accountSchema);

export function presentStartup(doc) {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    industry: doc.industry,
    stage: doc.stage,
    region: doc.region,
    price: doc.price,
    changeRate: doc.changeRate,
  };
}

export function presentAccount(doc) {
  return {
    cash: doc.cash,
    holdings: doc.holdings.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      averagePrice: item.averagePrice,
      price: item.price,
      value: item.value,
    })),
    orders: doc.orders.map((item) => ({
      id: item.id,
      startupId: item.startupId,
      name: item.name,
      side: item.side,
      quantity: item.quantity,
      price: item.price,
      amount: item.amount,
      createdAt: item.createdAt,
    })),
  };
}

// MongoDB에 연결하고, 기업이 하나도 없으면 샘플을 넣는다.
export async function connectDb() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/seedpick";
  await mongoose.connect(uri);

  const count = await Startup.countDocuments();
  if (count === 0) {
    await Startup.insertMany(startups);
  }
}

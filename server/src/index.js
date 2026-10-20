import cors from "cors";
import express from "express";
import startups from "./startups.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/startups", (req, res) => {
  res.json(startups);
});

app.get("/api/startups/:id", (req, res) => {
  const startup = startups.find((item) => item.id === req.params.id);

  if (!startup) {
    res.status(404).json({ message: "기업을 찾을 수 없습니다." });
    return;
  }

  res.json(startup);
});

app.listen(4000, () => {
  console.log("http://localhost:4000");
});

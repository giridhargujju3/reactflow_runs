/**
 * PD Visualization Backend (FINAL – RTL → RUN aware)
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const cors = require("cors");

console.log("### SERVER FILE LOADED FROM:", __filename);

const app = express();
app.use(cors());

const BASE_PATH = "C:/Users/Seai_/project/bugge/users";

/* ================= USERS ================= */
app.get("/api/users", (req, res) => {
  const users = fs.readdirSync(BASE_PATH, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  res.json(users);
});

/* ================= DESIGNS ================= */
app.get("/api/designs/:user", (req, res) => {
  const p = path.join(BASE_PATH, req.params.user);
  if (!fs.existsSync(p)) return res.json([]);
  const designs = fs.readdirSync(p, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  res.json(designs);
});

/* ================= RTLS ================= */
app.get("/api/rtls/:user/:design", (req, res) => {
  const p = path.join(BASE_PATH, req.params.user, req.params.design);
  if (!fs.existsSync(p)) return res.json([]);

  const rtls = fs.readdirSync(p, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  res.json(rtls);
});

/* ================= RUNS UNDER RTL ================= */
app.get("/api/runs/:user/:design/:rtl", (req, res) => {
  const cadencePath = path.join(
    BASE_PATH,
    req.params.user,
    req.params.design,
    req.params.rtl,
    "PD",
    "cadence"
  );

  if (!fs.existsSync(cadencePath)) return res.json([]);

  const runs = fs.readdirSync(cadencePath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  res.json(runs);
});

/* ================= CSV (RUN BASED) ================= */
app.get("/api/pd-main/:user/:design/:rtl/:run", (req, res) => {
  const csvPath = path.join(
    BASE_PATH,
    req.params.user,
    req.params.design,
    req.params.rtl,
    "PD",
    "cadence",
    req.params.run,
    "reports",
    "csv",
    "pd_main.csv"
  );

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({ error: "pd_main.csv not found" });
  }

  const rows = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", r => rows.push(r))
    .on("end", () => res.json(rows));
});

/* ================= START ================= */
app.listen(4000, () => {
  console.log("✅ Backend running on http://localhost:4000");
});


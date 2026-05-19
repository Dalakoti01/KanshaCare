import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import earthquakeRouter from "./routes/earthquake.router.js";
import locationRouter from './routes/location.router.js'
// import startEarthquakeCron from './cron/earthquake.cron.js';
dotenv.config();

connectDB();
// startEarthquakeCron()

const PORT = process.env.PORT;
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());

app.use("/api/earthquake", earthquakeRouter);
app.use("/api/location",locationRouter)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

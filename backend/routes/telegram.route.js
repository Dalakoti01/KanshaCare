import express from "express"
import { sendDailySummary } from "../controller/telegram.controller.js";

const app = express()

const router = express.Router()

router.route(
   "/daily-summary"
).get(sendDailySummary);

export default router
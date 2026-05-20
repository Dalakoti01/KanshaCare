import express from "express"

const app = express()

const router = express.Router()

router.route(
   "/daily-summary"
).get(sendDailySummary);

export default router
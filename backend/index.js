import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import earthquakeRouter from './routes/earthquake.router.js'
// import startEarthquakeCron from './cron/earthquake.cron.js';
dotenv.config();


connectDB()
// startEarthquakeCron()

const PORT = process.env.PORT
const app = express()

app.use('/api/earthquake',earthquakeRouter)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})


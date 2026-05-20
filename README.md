# 🌍 Earthquake Monitoring & Alerting Platform

A real-time earthquake monitoring platform that ingests live USGS seismic data, visualizes global earthquake activity, monitors user-selected locations, and delivers Telegram alerts for critical seismic events.

---

# 🚀 Live Deployment

## Dashboard
https://kansha-care.vercel.app

## Telegram Bot
@earthquake_sentinel_bot

---

# ✨ Features

## Global Dashboard
- Real-time earthquake incident tracker
- Time-range filtering (1h / 24h / 7d / 30d)
- Global earthquake analytics
- System health monitoring
- Live ingestion metrics

## Per-Location Monitoring
- Monitor up to 3 locations
- Risk score calculation
- Nearby earthquake tracking
- Strongest nearby event
- Average magnitude analytics
- Interactive maps using React Leaflet

## Telegram Alerts
### Real-time Alerts
- High severity earthquakes (Magnitude ≥ 5 globally)
- Location-based alerts (Magnitude ≥ 4 within 500km)
- Source silence alerts (USGS polling failure > 10 mins)

### Daily Summary
- Total earthquakes
- Magnitude breakdown
- Top active regions
- System health summary
- Monitored location risk scores

---

# 🏗️ Tech Stack

## Frontend
- React + Vite
- Tailwind CSS
- Redux Toolkit
- React Leaflet

## Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

## Infrastructure
- Render (Backend Hosting)
- Vercel (Frontend Hosting)
- cronjob.org (Scheduled Jobs)
- Telegram Bot API

---

# ⚙️ System Architecture

USGS Earthquake Feed
↓
Scheduled Ingestion (cronjob.org)
↓
Express Backend
↓
MongoDB Atlas
↓
Dashboard + Telegram Alerts

---

# 📦 Local Setup

## Clone Repository

```bash
git clone <repo-url>
cd KanshaCare
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=8000

MONGO_URI=your_mongodb_uri

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

FRONTEND_URL=http://localhost:5173


```

Run backend:

```bash
npm start
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`

```env
VITE_BACKEND_URI=https://kanshacare.onrender.com
```

Run frontend:

```bash
npm run dev
```

---

# 🤖 Telegram Bot Usage

1. Open Telegram
2. Search:

```txt
@earthquake_sentinel_bot
```

3. Start chat with the bot
4. Send any message
5. You are automatically subscribed to:
   - real-time alerts
   - daily summaries
   - operational notifications

---

# ⏱️ Scheduling

## Earthquake Sync
Runs every minute using cronjob.org

## Daily Summary
Runs every day at 9 PM IST

---

# 📊 System Health Monitoring

The platform tracks:
- Poll success rate
- Last successful sync
- Failed ingestion attempts
- Average execution time
- Historical backfill completion

---

# 🧠 Scaling Considerations

## Current Architecture
Optimized for:
- low operational complexity
- fast iteration
- assessment scope

## Scaling to 10,000 Users

### What stays
- MongoDB geospatial indexing
- Telegram alert architecture
- React dashboard
- ingestion pipeline

### What changes
- move from polling to queues/webhooks
- distributed alert workers
- Redis caching layer
- background job processing
- rate-limited notification service

### What breaks first
- synchronous Telegram broadcasting
- MongoDB query contention
- single-process ingestion bottleneck

---

# ⚠️ Failure Modes Considered

## USGS Feed Downtime
Handled using source silence alerts.

## Duplicate Alerts
Prevented using alert tracking flags.

## Render Sleeping
Mitigated using external cron scheduling.

## Large Dataset Fetching
Handled through pagination and filtered APIs.

---

# 🚧 Tradeoffs / Deliberate Omissions

## Not Implemented
- advanced swarm clustering
- per-user Telegram location subscriptions
- authentication system
- websocket-based live updates

## Why
The focus was placed on:
- ingestion reliability
- operational observability
- scalable alerting architecture
- clean deployment pipeline

---

# 👨‍💻 Author

Karan Dalakoti

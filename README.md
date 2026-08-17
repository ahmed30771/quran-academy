# Quran Academy

Full-stack online Quran academy: React frontend, Node.js + Express API, PostgreSQL, and JWT sessions.

The original HTML pages in this folder are a design reference. Run the app from `client` and `server`.

## Stack

- React + Vite (`client`)
- Node.js + Express (`server`)
- PostgreSQL
- JWT in an httpOnly cookie (session-style login)
- Passwords hashed with bcrypt

## Run locally

### 1. Start PostgreSQL

Create the database once. In pgAdmin or `psql` as a superuser, run `server/sql/setup-user.sql`.

Or with Docker:

```bash
docker compose up -d
```

If your PostgreSQL login is not `quran` / `quran`, copy `server/.env.example` to `server/.env` and set `DB_USER` / `DB_PASSWORD`. Default port is `5432`.

### 2. API

```bash
cd server
npm install
npm run setup
npm run dev
```

`npm run setup` creates tables and loads demo accounts.

API: `http://localhost:4000` — health check: `http://localhost:4000/api/health`

### 3. Website

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

## Demo logins

Password for all seeded accounts: `password123`

| Role | Email |
| --- | --- |
| Student | `fatima@quranacademy.example` |
| Teacher | `amina@quranacademy.example` |
| Admin | `admin@quranacademy.example` |

Teacher applications stay `pending` until an admin approves them. A pending teacher (`hassan@quranacademy.example`) is included in the seed.

## Auth

- Login / register return a JWT stored in an **httpOnly** cookie (`token`), `SameSite=Lax`
- Passwords are stored as **bcrypt hashes**, never in plain text
- Logout clears the cookie

Contact: WhatsApp `+92 309 2547332`, email `support@bluexech.com`.

## Deploy on Vercel

Vercel hosts the React site and the Express API. PostgreSQL stays on a host such as [Neon](https://neon.tech) (or Vercel Postgres). Vercel does not run a local database.

### 1. Create a Postgres database

1. Open [Neon](https://console.neon.tech) and create a project.
2. Copy the connection string (`postgresql://...`).
3. On your PC, from `server`, run setup against that database:

```powershell
cd "D:\bluexech\quran acadamy\server"
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/quran_academy?sslmode=require"
npm run setup
```

### 2. Push the code to GitHub

Commit this repo (including `vercel.json` and the `api` folder) and push to GitHub.

### 3. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import your GitHub repo.
3. Leave **Root Directory** as the repo root (not `client`).
4. Vercel will use `vercel.json` (build `client`, API from `api/index.js`).

### 4. Environment variables

In Vercel → Project → **Settings** → **Environment Variables**:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | a long random string |
| `CLIENT_ORIGIN` | `https://your-app.vercel.app` (your live URL) |

Redeploy after saving them.

### 5. Open the site

After the build succeeds, open the Vercel URL. Demo logins are the same as local (`password123`).

Health check: `https://your-app.vercel.app/api/health`

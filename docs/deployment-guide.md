# Hosting Groww Pulse on Vercel & Render/Railway

Since Groww Pulse is a full-stack application with a Next.js frontend and an Express polling backend, the standard production deployment structure is:

1. **Frontend (Next.js)** $\rightarrow$ Hosted on **Vercel** (Free Tier)
2. **Backend (Express + node-cron polling)** $\rightarrow$ Hosted on **Render** or **Railway** (Free Tier)

---

## Part 1: Push Code to GitHub

Open PowerShell and run:

```powershell
cd C:\Users\amand\OneDrive\Desktop\groww-pulse

# 1. Initialize Git
git init

# 2. Add all project files (.env is ignored automatically)
git add .

# 3. Commit
git commit -m "Groww Pulse Initial Production Build"

# 4. Link to your GitHub repository (create a repo on github.com first)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/groww-pulse.git
git push -u origin main
```

---

## Part 2: Deploy Backend to Render (2 Minutes)

Because your backend runs `node-cron` scheduled background polling, it needs a continuous Node.js server (like Render):

1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your `groww-pulse` repository.
4. Configure settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan Type:** Free
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `GEMINI_API_KEY`: *(your Gemini key)*
   - `FINNHUB_API_KEY`: *(your Finnhub key)*
   - `SUPABASE_URL`: `https://dxabchebkpwbqpelmyei.supabase.co`
   - `SUPABASE_SERVICE_KEY`: *(your Supabase service role key)*
   - `SUPABASE_JWT_SECRET`: `76f98b71-169a-4331-8657-0c73c99df820`
   - `DATABASE_URL`: *(your Supabase Postgres URL)*
6. Click **Deploy Web Service**.
7. Copy your Render URL (e.g. `https://groww-pulse-backend.onrender.com`).

---

## Part 3: Deploy Frontend to Vercel (1 Minute)

1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your `groww-pulse` repository.
4. In the configuration screen:
   - **Framework Preset:** Next.js
   - **Root Directory:** Click "Edit" and select `frontend`
5. Under **Environment Variables**, add these 3 variables:
   - `NEXT_PUBLIC_API_URL`: Paste your Render backend URL (e.g. `https://groww-pulse-backend.onrender.com`)
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://dxabchebkpwbqpelmyei.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: *(your Supabase anon public key)*
6. Click **Deploy**.

---

## That's it!
Your app will be live globally at `https://groww-pulse.vercel.app` with automated SSL, global CDN, and live background market tracking.

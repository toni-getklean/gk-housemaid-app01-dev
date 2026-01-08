# 🚀 Deploy GetKlean Dashboard to Fly.io with GitHub Actions

This guide will walk you through deploying your GetKlean Housemaid Booking Dashboard to Fly.io using GitHub Actions for automatic deployments.

## 📋 Prerequisites

- ✅ Fly.io account (you have this)
- ✅ `flyctl` installed on Windows PowerShell (you have this)
- ✅ `flyctl auth login` completed (you have this)
- GitHub account with your repository
- Git installed

---

## 🔧 Step 1: Initialize Fly.io App

Open PowerShell in your project directory and run:

```powershell
# This will create a new app on Fly.io
fly launch --no-deploy
```

### What this does:
- Creates a new Fly.io app
- Generates `fly.toml` configuration (we already have this)
- Registers your app name

### Follow the prompts:
1. **App name**: Accept the suggested name or choose your own (e.g., `getklean-dashboard`)
2. **Region**: Choose Singapore (`sin`) - closest to Philippines
3. **Database**: Select "No" (we don't need a database for now)
4. **Deploy now**: Select "No" (we'll deploy via GitHub Actions)

---

## 🔑 Step 2: Generate Fly.io API Token

In PowerShell, generate a deploy token:

```powershell
fly tokens create deploy -x 999999h
```

**Important**: Copy the entire token that starts with `FlyV1...` - you'll need this for GitHub!

---

## 📦 Step 3: Set Up GitHub Repository

### 3.1 Create GitHub Repository (if not already done)

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `getklean-dashboard`)
3. Don't initialize with README (we already have files)

### 3.2 Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the secret:
   - **Name**: `FLY_API_TOKEN`
   - **Value**: Paste the token from Step 2 (starts with `FlyV1...`)
5. Click **Add secret**

---

## 📤 Step 4: Push Code to GitHub

In PowerShell, from your project directory:

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit with Fly.io deployment setup"

# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

**Note**: If your default branch is `master` instead of `main`, use `master` in the command.

---

## 🎉 Step 5: Automatic Deployment

Once you push to GitHub:

1. GitHub Actions will automatically start deploying
2. Go to your repository → **Actions** tab
3. You'll see "Deploy to Fly.io" workflow running
4. Wait for it to complete (usually 3-5 minutes for first deployment)

---

## ✅ Step 6: Verify Deployment

After deployment completes:

```powershell
# Open your deployed app in browser
fly open

# Check app status
fly status

# View logs
fly logs
```

Your app will be live at: `https://YOUR_APP_NAME.fly.dev`

---

## 🔄 Future Deployments

Every time you push to the `main` branch:
1. GitHub Actions automatically triggers
2. Builds a new Docker image
3. Deploys to Fly.io
4. Zero downtime deployment

### To deploy manually from your computer:

```powershell
fly deploy
```

---

## 🔐 Environment Variables / Secrets (Optional)

If you need to add environment variables:

### For runtime secrets (server-side only):

```powershell
fly secrets set DATABASE_URL=your_database_url
fly secrets set API_KEY=your_api_key
```

### For build-time variables (NEXT_PUBLIC_*):

Update `fly.toml` and add:

```toml
[build.args]
  NEXT_PUBLIC_API_URL = "https://api.example.com"
```

Or deploy with build arguments:

```powershell
fly deploy --build-arg NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## 📊 Useful Fly.io Commands

```powershell
# View app status
fly status

# View real-time logs
fly logs

# Check app info
fly info

# Scale memory (if needed)
fly scale memory 2048

# SSH into your app
fly ssh console

# List all your apps
fly apps list

# Destroy app (careful!)
fly apps destroy YOUR_APP_NAME
```

---

## 🐛 Troubleshooting

### Build fails with "out of memory"
```powershell
fly scale memory 2048
```

### App won't start
```powershell
fly logs
# Check logs for errors
```

### Update app name
Edit `fly.toml` and change the `app = "your-app-name"` line

### GitHub Actions fails
1. Check if `FLY_API_TOKEN` secret is set correctly
2. Verify token hasn't expired
3. Check Actions logs for specific error

---

## 📚 Files Created

- ✅ `Dockerfile` - Docker configuration for building the app
- ✅ `.dockerignore` - Files to exclude from Docker build
- ✅ `fly.toml` - Fly.io app configuration
- ✅ `.github/workflows/deploy.yml` - GitHub Actions workflow
- ✅ `next.config.mjs` - Updated with `output: "standalone"`

---

## 🎯 Summary

1. ✅ Run `fly launch --no-deploy`
2. ✅ Run `fly tokens create deploy -x 999999h` and copy token
3. ✅ Add `FLY_API_TOKEN` secret to GitHub
4. ✅ Push code to GitHub
5. ✅ Watch automatic deployment in Actions tab
6. ✅ Visit your app at `https://YOUR_APP_NAME.fly.dev`

---

## 🌏 Region Recommendation

For Philippine users, choose:
- **Primary**: `sin` (Singapore) - lowest latency
- **Alternative**: `hkg` (Hong Kong) or `nrt` (Tokyo)

---

## 💰 Cost

Fly.io free tier includes:
- Up to 3 shared-cpu-1x VMs
- 3GB persistent volume storage
- 160GB outbound data transfer

Your app should stay within free tier with auto_stop_machines enabled!

---

Need help? Check the logs with `fly logs` or visit [Fly.io Docs](https://fly.io/docs)

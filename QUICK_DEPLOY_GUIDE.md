# ⚡ Quick Deploy Guide - GetKlean to Fly.io

## 🎯 Quick Setup (5 minutes)

### 1️⃣ Initialize Fly.io App
```powershell
fly launch --no-deploy
```
- Choose app name (e.g., `getklean-dashboard`)
- Select region: `sin` (Singapore)
- No database: Select "No"
- Don't deploy: Select "No"

### 2️⃣ Generate Deploy Token
```powershell
fly tokens create deploy -x 999999h
```
📋 **Copy the token** (starts with `FlyV1...`)

### 3️⃣ Add GitHub Secret
1. Go to: `github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `FLY_API_TOKEN`
4. Value: Paste the token from step 2
5. Click **Add secret**

### 4️⃣ Push to GitHub
```powershell
git add .
git commit -m "Add Fly.io deployment"
git push origin main
```

### 5️⃣ Monitor Deployment
1. Go to: `github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. Watch "Deploy to Fly.io" workflow
3. Wait 3-5 minutes

### 6️⃣ Open Your App
```powershell
fly open
```

✅ **Done!** Your app is live at `https://YOUR_APP_NAME.fly.dev`

---

## 🔄 Daily Workflow

Just push to GitHub:
```powershell
git add .
git commit -m "your changes"
git push
```
GitHub Actions deploys automatically! 🎉

---

## 🛠️ Common Commands

```powershell
fly logs              # View logs
fly status            # Check app status
fly open              # Open in browser
fly deploy            # Manual deploy
fly secrets set KEY=value  # Add secrets
```

---

## 🆘 Quick Troubleshooting

**Build fails?**
```powershell
fly scale memory 2048
```

**Want to see what's happening?**
```powershell
fly logs
```

**GitHub Actions failing?**
- Check if `FLY_API_TOKEN` secret is added
- Verify token is correct
- Check Actions tab for error details

---

## 📱 Your App URLs

After deployment:
- **Production**: `https://YOUR_APP_NAME.fly.dev`
- **Dashboard**: `https://fly.io/dashboard/YOUR_APP_NAME`

---

See **DEPLOYMENT.md** for detailed instructions and troubleshooting!

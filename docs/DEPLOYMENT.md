# SmartAttend Hub - Vercel Deployment Guide

## Prerequisites
1. GitHub account
2. Vercel account
3. Firebase project
4. Neon PostgreSQL database

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/smart-attend-hub.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_DATABASE_URL`
5. Click "Deploy"

### 3. Environment Variables Setup
Copy values from your `.env` file to Vercel environment variables:
- Firebase config from Firebase Console
- Database URL from Neon dashboard

### 4. Build Settings (Auto-detected)
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Post-Deployment
1. Test all features
2. Verify Firebase authentication
3. Check database connectivity
4. Test file uploads and exports

## Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Troubleshooting
- Check build logs in Vercel dashboard
- Verify environment variables are set
- Ensure Firebase and Neon services are active
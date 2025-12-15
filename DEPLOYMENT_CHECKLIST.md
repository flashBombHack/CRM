# Deployment Checklist

Use this checklist before deploying to Vercel.

## Pre-Deployment

- [ ] All code is committed and pushed to GitHub
- [ ] `.env.local` is in `.gitignore` (should not be committed)
- [ ] `.env.example` exists and is committed (template for environment variables)
- [ ] All dependencies are installed (`npm install`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors (`npm run lint`)

## Vercel Setup

- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Environment variable `NEXT_PUBLIC_API_BASE_URL` added in Vercel dashboard
  - [ ] Added for Production environment
  - [ ] Added for Preview environment
  - [ ] Added for Development environment

## Post-Deployment

- [ ] Application loads successfully
- [ ] Sign in page is accessible
- [ ] Login functionality works
- [ ] Dashboard is accessible after login
- [ ] User name displays correctly in header
- [ ] Logout functionality works
- [ ] API calls are working (no CORS errors)

## Environment Variables in Vercel

To add environment variables in Vercel:

1. Go to your project dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://democrm-rsqo.onrender.com`
   - **Environments**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application

## Quick Deploy Commands

```bash
# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Push to GitHub
git push origin main

# Deploy to Vercel (if using CLI)
vercel --prod
```



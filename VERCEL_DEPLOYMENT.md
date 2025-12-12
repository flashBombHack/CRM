# Vercel Deployment Guide

This guide will help you deploy the CRM application to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. Your repository pushed to GitHub

## Deployment Steps

### 1. Push to GitHub

First, make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### 3. Configure Environment Variables

**Important**: You must add environment variables in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://democrm-rsqo.onrender.com` |

4. Make sure to add it for all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### 4. Redeploy

After adding environment variables, you need to redeploy:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**

Or trigger a new deployment by pushing a new commit.

## Environment Variables

### Required Variables

- `NEXT_PUBLIC_API_BASE_URL`: The base URL of your API (e.g., `https://democrm-rsqo.onrender.com`)

### Why `NEXT_PUBLIC_` prefix?

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. This is necessary for client-side API calls.

## Troubleshooting

### Build Fails

- Check that all environment variables are set in Vercel dashboard
- Verify the API URL is correct and accessible
- Check build logs in Vercel dashboard for specific errors

### API Calls Fail After Deployment

- Ensure `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Verify the API server allows requests from your Vercel domain
- Check browser console for CORS errors

### Environment Variables Not Working

- Make sure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing environment variables
- Clear browser cache if issues persist

## Local Development

For local development, create a `.env.local` file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your values. This file is git-ignored and won't be committed.

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)


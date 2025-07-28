# Production Deployment Guide

This guide walks you through deploying the LoveSync couples dashboard to production using GitHub and Vercel.

## Prerequisites

Before deploying, ensure you have:

1. **GitHub account** with repository access
2. **Vercel account** connected to GitHub
3. **Supabase project** with database credentials
4. **Google Cloud Console project** with OAuth configured

## Step 1: Prepare Your Repository

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/lovesync.git
   git push -u origin main
   ```

## Step 2: Database Setup (Supabase)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Create a new project or select existing one
3. Go to **Settings** → **Database**
4. Under **Connection string** → **Transaction pooler**, copy the URI
5. Replace `[YOUR-PASSWORD]` with your database password
6. Save this as your `DATABASE_URL`

## Step 3: Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen if needed
6. Add authorized origins:
   - `https://your-app-name.vercel.app`
7. Add redirect URIs:
   - `https://your-app-name.vercel.app/api/auth/google/callback`
8. Save your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## Step 4: Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **New Project**
   - Import your GitHub repository

2. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

3. **Set Environment Variables**:
   In your Vercel project settings, add these environment variables:

   ```env
   DATABASE_URL=postgresql://username:password@hostname:port/database
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   SESSION_SECRET=your_long_random_session_secret_here
   PARTNER1_EMAIL=partner1@gmail.com
   PARTNER2_EMAIL=partner2@gmail.com
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click **Deploy**
   - Wait for the build to complete

## Step 5: Post-Deployment Setup

1. **Test the deployment**:
   - Visit your Vercel app URL
   - Go to `/setup` to verify configuration
   - Test Google OAuth login

2. **Initialize the database**:
   - The database tables will be created automatically on first connection
   - Visit the app and try logging in to trigger database initialization

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Supabase | `postgresql://user:pass@host:port/db` |
| `GOOGLE_CLIENT_ID` | OAuth client ID from Google Cloud Console | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret from Google Cloud Console | `GOCSPX-abcdefghijklmnop` |
| `SESSION_SECRET` | Random string for session encryption | `your-super-long-random-string-here` |
| `PARTNER1_EMAIL` | First authorized Gmail address | `partner1@gmail.com` |
| `PARTNER2_EMAIL` | Second authorized Gmail address | `partner2@gmail.com` |

## Security Considerations

- **Email Restriction**: Only the two specified Gmail addresses can access the app
- **Session Security**: Sessions are encrypted using the `SESSION_SECRET`
- **HTTPS Only**: All production traffic uses HTTPS
- **Database Security**: Use Supabase's built-in security features

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure TypeScript compilation passes locally with `npm run check`
- Verify all environment variables are set

### OAuth Issues
- Verify authorized origins and redirect URIs in Google Cloud Console
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure the OAuth consent screen is configured

### Database Connection Issues
- Verify `DATABASE_URL` is correct and accessible
- Check Supabase project status and connection limits
- Test database connection locally first

### Application Errors
- Check Vercel function logs in the dashboard
- Visit `/api/health` to test API functionality
- Review browser console for frontend errors

## Monitoring and Maintenance

- **Vercel Analytics**: Monitor performance and usage
- **Database Monitoring**: Use Supabase dashboard for database metrics
- **Error Tracking**: Check Vercel function logs for server errors
- **Security Updates**: Regularly update dependencies

## Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Google OAuth settings with new domain

## Backup Strategy

- **Database**: Supabase provides automatic backups
- **Code**: Maintained in GitHub repository
- **Environment Variables**: Document securely and separately

Your LoveSync app is now production-ready and deployed to Vercel!
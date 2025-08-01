# BTMM Trading App - Deployment Guide

This guide will help you deploy your BTMM Trading Application to GitHub and Vercel.

## 🚀 Quick Deployment Steps

### 1. Deploy to GitHub

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: BTMM Trading App"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `btmm-trading-app` (or your preferred name)
   - Make it Public or Private (your choice)
   - Don't initialize with README (we already have files)
   - Click "Create repository"

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/btmm-trading-app.git
   git branch -M main
   git push -u origin main
   ```

### 2. Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Website** (Recommended)
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Or Deploy via CLI**
   ```bash
   vercel --prod
   ```

## 🔧 Environment Variables for Vercel

In your Vercel dashboard, add these environment variables:

### Required Variables
```
DATABASE_URL=postgresql://postgres.your_password@aws-0-us-west-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=production
```

### Optional Variables (for future features)
```
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
XAI_API_KEY=your_xai_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
```

## 📋 Pre-Deployment Checklist

### ✅ Files Created
- [x] `.gitignore` - Excludes sensitive files
- [x] `vercel.json` - Vercel configuration
- [x] `.env.example` - Environment template
- [x] `DEPLOYMENT.md` - This guide

### ✅ Database Setup
- [ ] Run SQL schema in Supabase (from `database/schema.sql`)
- [ ] Configure Row Level Security policies
- [ ] Set up storage bucket for screenshots

### ✅ Authentication Setup
- [ ] Configure Google OAuth (optional, see `GOOGLE_OAUTH_SETUP.md`)
- [ ] Update Supabase auth settings

## 🌐 Production Configuration

### Update URLs for Production

1. **Update Google OAuth** (if using)
   - Add your Vercel domain to authorized origins
   - Update redirect URIs

2. **Update Supabase Settings**
   - Add your Vercel domain to allowed origins
   - Configure auth redirects

3. **Test Production Build**
   ```bash
   npm run build  # if you add build scripts
   npm start
   ```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to Git
- Use Vercel's environment variable dashboard
- Rotate secrets regularly

### Database Security
- Enable Row Level Security (RLS) in Supabase
- Use service role key only for admin operations
- Monitor database access logs

### API Security
- JWT tokens expire automatically
- CORS is configured for your domain
- Rate limiting recommended for production

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check for missing environment variables

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check Supabase project status
   - Ensure database password is correct

3. **Authentication Problems**
   - Verify JWT_SECRET is set
   - Check Supabase auth configuration
   - Ensure Google OAuth URLs are correct

### Vercel-Specific Issues

1. **Function Timeout**
   - Vercel has a 10-second timeout for serverless functions
   - Optimize database queries
   - Consider using Vercel Pro for longer timeouts

2. **Cold Starts**
   - First request may be slower
   - Consider keeping functions warm with periodic requests

## 📊 Monitoring & Analytics

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance and usage
- Set up alerts for errors

### Supabase Monitoring
- Monitor database performance
- Check authentication logs
- Set up backup schedules

## 🚀 Post-Deployment

### Testing
1. Test all authentication flows
2. Verify trade creation and management
3. Test screenshot upload functionality
4. Check analytics and reporting

### Performance
1. Monitor response times
2. Optimize database queries
3. Consider CDN for static assets

### Maintenance
1. Regular dependency updates
2. Security patches
3. Database maintenance
4. Backup verification

---

## 🎉 You're Ready to Deploy!

Your BTMM Trading App is now ready for production deployment. Follow the steps above to get it live on Vercel with GitHub integration.

### Quick Start Commands:
```bash
# 1. Initialize and push to GitHub
git init
git add .
git commit -m "Initial commit: BTMM Trading App"
git remote add origin https://github.com/YOUR_USERNAME/btmm-trading-app.git
git push -u origin main

# 2. Deploy to Vercel (via website or CLI)
vercel --prod
```

Good luck with your trading app! 📈

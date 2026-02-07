# Vercel Deployment Guide for Expense Tracker

## Prerequisites
- GitHub account
- Vercel account
- MongoDB Atlas account (for database)
- Your repository cloned and configured

## Step 1: Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with username and password
4. Get your connection string from Database > Connect > Connect your application
5. Whitelist all IPs (0.0.0.0/0) for Vercel deployment

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and login
2. Click "Add New..." > "Project"
3. Import your GitHub repository: `Bharathi-71772218105/Expense-Tracker`
4. Vercel will automatically detect the settings from `vercel.json`

## Step 3: Configure Environment Variables
In your Vercel project dashboard, go to Settings > Environment Variables and add:

1. **MONGODB_URL**: Your MongoDB connection string
   ```
   mongodb+srv://your_username:your_password@your_cluster.mongodb.net/expense_tracker?retryWrites=true&w=majority
   ```

2. **JWT_SECRET**: A secure random string
   ```
   your_jwt_secret_key_here
   ```

3. **NODE_ENV**: `production`

4. **FRONTEND_URL**: Your Vercel app URL (after first deployment)
   ```
   https://your-app-name.vercel.app
   ```

## Step 4: Redeploy
After setting environment variables, redeploy:
- Using CLI: `vercel --prod`
- Or trigger a new deployment from the Vercel dashboard

## Step 5: Update CORS
After your first deployment, update the FRONTEND_URL environment variable with your actual Vercel URL and redeploy.

## Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure MongoDB string is correct and IP is whitelisted
2. **CORS Errors**: Make sure FRONTEND_URL matches your deployed URL
3. **Build Failures**: Check that all dependencies are in package.json
4. **API Routes**: Ensure routes are properly prefixed with `/api`

### Useful Commands:
```bash
# Check deployment logs
vercel logs

# List deployments
vercel list

# Remove deployment
vercel rm <deployment-url>
```

## Project Structure After Configuration:
```
Expense-Tracker/
├── vercel.json          # Vercel configuration
├── .env.example         # Environment variables template
├── client/
│   ├── package.json     # Updated with homepage field
│   └── build/           # Generated build output
└── server/
    ├── server.js        # Updated CORS configuration
    └── package.json
```

Your Expense Tracker should now be live on Vercel!

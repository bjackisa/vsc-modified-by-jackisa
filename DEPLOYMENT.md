# Deployment Guide

## Prerequisites

Before deploying to Vercel, make sure you have:

1. A Vercel account
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Access to your database credentials

## Environment Variables

The following environment variables must be set in your Vercel project:

- `DATABASE_URL`: Your Neon database connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- Any other environment variables used in your application

## Deployment Steps

1. **Import your project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your Git repository
   - Configure project settings

2. **Configure Environment Variables**:
   - In the project settings, go to "Environment Variables"
   - Add all required environment variables from your local `.env.local` file

3. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

## Troubleshooting

If you encounter a 404 error after deployment:

1. **Check Environment Variables**:
   - Verify all environment variables are correctly set in Vercel

2. **Check Build Logs**:
   - Review the build logs for any errors

3. **Middleware Issues**:
   - If you suspect middleware issues, try using the simplified middleware file:
   - Rename `middleware.simple.ts` to `middleware.ts` and deploy again

4. **Database Connection**:
   - Ensure your database is accessible from Vercel's servers
   - Check if your database connection string is correct

5. **API Routes**:
   - Check if your API routes are working by directly accessing them

## Using the Simplified Middleware

If you're having issues with the complex middleware, you can use the simplified version:

```bash
# Backup the current middleware
mv middleware.ts middleware.complex.ts

# Use the simplified middleware
mv middleware.simple.ts middleware.ts
```

Then redeploy your application.

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Clerk Documentation](https://clerk.com/docs)

# Google OAuth Setup Instructions

To enable Google authentication in your BTMM Trading App, follow these steps:

## 1. Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click on the project dropdown at the top
   - Either select an existing project or create a new one
   - Name it something like "BTMM Trading App"

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity Services API"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Name it "BTMM Trading App Web Client"

5. **Configure Authorized Origins and Redirect URIs**
   - **Authorized JavaScript origins:**
     - `http://localhost:5000`
     - `http://127.0.0.1:5000`
     - Add your production domain when you deploy
   
   - **Authorized redirect URIs:**
     - `http://localhost:5000/auth/callback`
     - `http://127.0.0.1:5000/auth/callback`
     - Add your production callback URLs when you deploy

6. **Get Your Client ID**
   - After creating, you'll see your Client ID
   - Copy this Client ID (it looks like: `1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`)

## 2. Configure Your Application

1. **Update Environment Variables**
   - Add to your `.env` file:
   ```
   GOOGLE_OAUTH_CLIENT_ID=your_actual_client_id_here
   ```

2. **Update the JavaScript Code**
   - Open `public/app.js`
   - Find the line with the placeholder Client ID:
   ```javascript
   client_id: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'
   ```
   - Replace it with:
   ```javascript
   client_id: 'YOUR_ACTUAL_CLIENT_ID_HERE'
   ```

## 3. Configure Supabase for Google OAuth

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com
   - Go to "Authentication" > "Providers"

2. **Enable Google Provider**
   - Find "Google" in the list and toggle it on
   - Enter your Google OAuth credentials:
     - **Client ID**: Your Google OAuth Client ID
     - **Client Secret**: Your Google OAuth Client Secret (from Google Cloud Console)

3. **Configure Redirect URL**
   - The redirect URL should be:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   - Add this URL to your Google OAuth configuration as well

## 4. Test the Integration

1. **Restart your server**
   ```bash
   npm run dev
   ```

2. **Open the app**
   - Go to http://localhost:5000
   - You should see "Sign in with Google" buttons on both login and register forms

3. **Test Google Sign-In**
   - Click the Google button
   - Complete the Google OAuth flow
   - You should be automatically logged in and redirected to the dashboard

## 5. Production Deployment

When deploying to production:

1. **Update Google OAuth Configuration**
   - Add your production domain to authorized origins
   - Add production callback URLs

2. **Update Environment Variables**
   - Set the production Google Client ID
   - Update Supabase configuration for production

3. **Update JavaScript**
   - Consider loading the Client ID from environment variables for better security

## Troubleshooting

**Common Issues:**

1. **"redirect_uri_mismatch" error**
   - Make sure your redirect URIs in Google Console match exactly
   - Include both localhost and 127.0.0.1 for development

2. **Google button not appearing**
   - Check browser console for JavaScript errors
   - Ensure Google GSI script is loading properly
   - Verify Client ID is correct

3. **Authentication fails**
   - Check Supabase logs in the dashboard
   - Verify Google provider is enabled in Supabase
   - Ensure Client Secret is correctly set in Supabase

4. **CORS errors**
   - Make sure your domain is in the authorized origins
   - Check that CORS is properly configured in your Fastify server

## Security Notes

- Never expose your Client Secret in frontend code
- Use environment variables for sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor authentication logs for suspicious activity

---

Once you complete these steps, users will be able to sign in with their Google accounts and automatically register if they're new users!

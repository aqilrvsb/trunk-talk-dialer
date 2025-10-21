# SIP Dialer Deployment Guide

This guide will help you deploy the SIP WebSocket gateway to Fly.io and configure your app to use it.

## Prerequisites

1. A Fly.io account (sign up at https://fly.io)
2. Fly.io CLI installed
3. A SIP provider account (e.g., AlienVoIP)

## Step 1: Set Up External Supabase Database

The SQL for creating the `sip_accounts` table has been provided. Run this in your Supabase SQL Editor:

**Supabase Project**: https://ahexnoaazbveiyhplfrc.supabase.co

```sql
-- Create SIP accounts table
CREATE TABLE public.sip_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  sip_server TEXT NOT NULL,
  sip_username TEXT NOT NULL,
  sip_password TEXT NOT NULL,
  display_name TEXT,
  phone_number TEXT,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sip_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own accounts"
  ON public.sip_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts"
  ON public.sip_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.sip_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.sip_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.sip_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

## Step 2: Enable Authentication in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ahexnoaazbveiyhplfrc
2. Navigate to Authentication > Providers
3. Enable Email provider (already enabled by default)
4. Optional: Enable additional providers (Google, GitHub, etc.)

## Step 3: Deploy WebSocket Gateway to Fly.io

### Install Fly.io CLI

**macOS:**
```bash
brew install flyctl
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Authenticate

```bash
flyctl auth login
```

### Deploy the Gateway

```bash
# Navigate to the gateway directory
cd fly-gateway

# Create a new Fly.io app (choose a unique name)
flyctl apps create sip-gateway-YOUR-UNIQUE-NAME

# Update fly.toml with your app name
# Edit fly-gateway/fly.toml and change:
# app = "sip-gateway-YOUR-UNIQUE-NAME"

# Deploy
flyctl deploy

# Your gateway will be available at:
# wss://sip-gateway-YOUR-UNIQUE-NAME.fly.dev
```

## Step 4: Update App Configuration

After deploying to Fly.io, update the gateway configuration:

**Edit `src/config/gateway.ts`:**

```typescript
export const GATEWAY_CONFIG = {
  // Replace with your actual Fly.io app URL
  GATEWAY_URL: 'wss://sip-gateway-YOUR-UNIQUE-NAME.fly.dev',
  
  USE_EDGE_FUNCTION: false, // Keep this false
};
```

## Step 5: Build and Deploy Your App

```bash
# Install dependencies (if not already done)
npm install

# Build the app
npm run build

# Deploy to your hosting provider (Vercel, Netlify, etc.)
# Or run locally:
npm run dev
```

## Step 6: Create a User Account

1. Navigate to your app
2. Go to the Accounts page (click Settings/Accounts in the bottom nav)
3. You'll need to sign up/sign in with Supabase Auth
4. Add your first SIP account with your provider's credentials

## Testing

### 1. Check Gateway Health

```bash
curl https://sip-gateway-YOUR-UNIQUE-NAME.fly.dev/health
```

Should return: `OK`

### 2. View Logs

```bash
flyctl logs
```

### 3. Test SIP Connection

1. Open your app
2. Navigate to Accounts page
3. Add a SIP account
4. Click "Connect" on the account
5. Try making a call

## Troubleshooting

### Gateway Connection Fails

**Check Fly.io logs:**
```bash
flyctl logs
```

**Common issues:**
- SIP server hostname/port incorrect
- Firewall blocking Fly.io IP addresses
- SIP credentials invalid

### Authentication Issues

**Verify Supabase auth is enabled:**
- Check Supabase dashboard > Authentication
- Verify email confirmation is disabled for development
- Check browser console for auth errors

### Call Quality Issues

**Check:**
- Network connection quality
- STUN server accessibility
- Firewall rules for WebRTC ports

## Scaling

### Add More Regions

```bash
flyctl regions add ams lhr syd
```

### Monitor Usage

```bash
flyctl status
flyctl dashboard
```

### Scale Resources

```bash
# Increase VM size if needed
flyctl scale vm shared-cpu-2x

# Set auto-scaling
flyctl autoscale set min=1 max=3
```

## Costs

- **Fly.io**: Free tier includes 3 shared-cpu VMs
- **Supabase**: Free tier includes 500MB database + 2GB bandwidth
- Additional costs only if you exceed free tier limits

## Security Notes

⚠️ **IMPORTANT**: Never commit your service_role key to Git! The anon key provided in the code is safe for client-side use as it respects RLS policies.

## Support

- Fly.io docs: https://fly.io/docs
- Supabase docs: https://supabase.com/docs
- JsSIP docs: https://jssip.net/documentation

## Next Steps

- Add authentication UI (login/signup pages)
- Implement call history
- Add contact management
- Set up push notifications for incoming calls

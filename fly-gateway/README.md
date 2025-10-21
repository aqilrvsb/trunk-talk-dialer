# SIP Gateway for Fly.io

This is a WebSocket-to-SIP TCP gateway that allows browser-based SIP clients to connect to traditional SIP servers.

## Deployment Steps

### 1. Install Fly.io CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 2. Authenticate

```bash
flyctl auth login
```

### 3. Create the App

```bash
# Navigate to this directory
cd fly-gateway

# Create a new Fly.io app (you can choose a custom name)
flyctl apps create sip-gateway-YOUR-NAME
```

### 4. Update fly.toml

Edit `fly.toml` and update the app name to match what you created:

```toml
app = "sip-gateway-YOUR-NAME"
```

### 5. Deploy

```bash
flyctl deploy
```

### 6. Get Your Gateway URL

After deployment, your gateway will be available at:
```
wss://sip-gateway-YOUR-NAME.fly.dev
```

### 7. Update Your Frontend

In your React app, update the SIP service to use your Fly.io gateway URL instead of the Supabase edge function.

## Testing

To test the gateway:

```bash
# Check logs
flyctl logs

# Check status
flyctl status

# SSH into the machine
flyctl ssh console
```

## Scaling

```bash
# Scale to multiple regions for better global performance
flyctl regions add ams lhr syd

# Set machine size
flyctl scale vm shared-cpu-1x

# Auto-scaling (optional)
flyctl autoscale set min=1 max=3
```

## Cost

- Fly.io offers generous free tier
- The gateway uses minimal resources when idle
- Auto-stop/start keeps costs low

## Troubleshooting

If connections fail:
1. Check logs: `flyctl logs`
2. Verify SIP server is accessible from Fly.io's network
3. Check firewall rules on your SIP server
4. Ensure port 5060 (or custom port) is open

// WebSocket Gateway Configuration
// 
// IMPORTANT: After deploying to Fly.io, update GATEWAY_URL below
// with your Fly.io app URL (e.g., wss://sip-gateway-YOUR-NAME.fly.dev)

export const GATEWAY_CONFIG = {
  // Use Fly.io gateway (recommended for production)
  GATEWAY_URL: 'wss://trunk-talk-dialer.fly.dev',
  
  // Fallback to Supabase edge function (won't work due to network restrictions)
  // Only for local development testing
  USE_EDGE_FUNCTION: false,
};

// Get the appropriate gateway URL
export const getGatewayUrl = (): string => {
  if (GATEWAY_CONFIG.USE_EDGE_FUNCTION) {
    const projectId = 'dpkgepnnfsmgygcyoxqy';
    return `wss://${projectId}.supabase.co/functions/v1/sip-gateway`;
  }
  
  return GATEWAY_CONFIG.GATEWAY_URL;
};

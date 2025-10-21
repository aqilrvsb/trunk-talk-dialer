import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ConnectionInfo = () => {
  return (
    <div className="space-y-4 mb-6">
      <Alert className="bg-card/50 border-border">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important: WebSocket Support Required</AlertTitle>
        <AlertDescription className="text-sm mt-2 space-y-2">
          <p>
            Browser-based SIP calling requires your provider to support WebSocket connections (WSS/WS).
          </p>
          <p className="text-muted-foreground">
            <strong>AlienVoIP Note:</strong> Traditional SIP providers like AlienVoIP typically use UDP/TCP 
            which doesn't work in browsers. You may need:
          </p>
          <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
            <li>A WebRTC-enabled SIP provider (like Twilio, Vonage)</li>
            <li>Or deploy a WebSocket-to-SIP gateway (FreeSWITCH, Asterisk with WebRTC)</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectionInfo;

import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ConnectionInfo = () => {
  return (
    <div className="space-y-4 mb-6">
      <Alert className="bg-card/50 border-border">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>WebSocket Gateway Active</AlertTitle>
        <AlertDescription className="text-sm mt-2 space-y-2">
          <p>
            This dialer uses a WebSocket-to-SIP gateway to connect your browser to AlienVoIP's traditional SIP network.
          </p>
          <p className="text-muted-foreground">
            <strong>How it works:</strong> Your browser connects via WebSocket to our gateway, which translates to TCP/UDP SIP for AlienVoIP.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Audio routing (RTP) may require additional configuration for optimal quality.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectionInfo;

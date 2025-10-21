import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Settings } from "lucide-react";

interface SIPStatusProps {
  isConnected: boolean;
  onConfigClick: () => void;
}

const SIPStatus = ({ isConnected, onConfigClick }: SIPStatusProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium">Connected</p>
                <p className="text-xs text-muted-foreground">AlienVoIP SIP</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium">Disconnected</p>
                <p className="text-xs text-muted-foreground">Configure SIP</p>
              </div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onConfigClick}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};

export default SIPStatus;

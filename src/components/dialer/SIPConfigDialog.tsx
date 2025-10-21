import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { sipService } from "@/lib/sipService";

interface SIPConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

const SIPConfigDialog = ({ open, onOpenChange, onConnected }: SIPConfigDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    server: "sip1.alienvoip.com",
    username: "646006395",
    password: "Xh7Yk5Ydcg",
    displayName: "SIP Dialer",
  });

  const handleConnect = async () => {
    setLoading(true);
    try {
      await sipService.connect(config);
      toast({
        title: "Connected",
        description: "Successfully connected to AlienVoIP",
      });
      onConnected();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to SIP server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>SIP Configuration</DialogTitle>
          <DialogDescription>
            Configure your AlienVoIP SIP trunk settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="server">SIP Server</Label>
            <Input
              id="server"
              value={config.server}
              onChange={(e) => setConfig({ ...config, server: e.target.value })}
              placeholder="sip1.alienvoip.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              placeholder="646006395"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              placeholder="••••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={config.displayName}
              onChange={(e) => setConfig({ ...config, displayName: e.target.value })}
              placeholder="SIP Dialer"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SIPConfigDialog;

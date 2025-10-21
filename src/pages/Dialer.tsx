import { useState, useEffect } from "react";
import Dialpad from "@/components/dialer/Dialpad";
import CallInterface from "@/components/dialer/CallInterface";
import SIPStatus from "@/components/dialer/SIPStatus";
import SIPConfigDialog from "@/components/dialer/SIPConfigDialog";
import ConnectionInfo from "@/components/dialer/ConnectionInfo";
import { Button } from "@/components/ui/button";
import { Phone, Users, Clock, Settings } from "lucide-react";
import { sipService } from "@/lib/sipService";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type CallState = "idle" | "connecting" | "ringing" | "connected" | "ended";

const Dialer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [isConnected, setIsConnected] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Auto-connect on mount if not connected
    if (!sipService.isConnected()) {
      setShowConfig(true);
    }

    return () => {
      sipService.disconnect();
    };
  }, []);

  const handleNumberInput = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!phoneNumber) return;

    if (!sipService.isConnected()) {
      toast({
        title: "Not Connected",
        description: "Please configure SIP settings first",
        variant: "destructive",
      });
      setShowConfig(true);
      return;
    }

    setCallState("connecting");

    sipService.makeCall(
      phoneNumber,
      () => {
        // onProgress
        setCallState("ringing");
        toast({
          title: "Calling",
          description: `Calling ${phoneNumber}...`,
        });
      },
      () => {
        // onConnected
        setCallState("connected");
        toast({
          title: "Call Connected",
          description: "Call is now active",
        });
      },
      () => {
        // onEnded
        setCallState("ended");
        setTimeout(() => {
          setCallState("idle");
          setPhoneNumber("");
        }, 2000);
      },
      (error) => {
        // onFailed
        toast({
          title: "Call Failed",
          description: error,
          variant: "destructive",
        });
        setCallState("idle");
      }
    );
  };

  const handleHangup = () => {
    sipService.hangup();
    setCallState("idle");
    setPhoneNumber("");
  };

  const handleToggleMute = () => {
    const muted = sipService.toggleMute();
    setIsMuted(muted);
  };

  const handleConfigClick = () => {
    setShowConfig(true);
  };

  const handleConnected = () => {
    setIsConnected(true);
  };

  const isInCall = callState === "connecting" || callState === "ringing" || callState === "connected";

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <header className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SIP Dialer
          </h1>
          <p className="text-muted-foreground mt-1">Professional VoIP Calling</p>
        </header>

        {!isConnected && <ConnectionInfo />}

        <SIPStatus isConnected={isConnected} onConfigClick={handleConfigClick} />

        {isInCall ? (
          <CallInterface
            phoneNumber={phoneNumber}
            callState={callState}
            isMuted={isMuted}
            onHangup={handleHangup}
            onToggleMute={handleToggleMute}
          />
        ) : (
          <Dialpad
            phoneNumber={phoneNumber}
            onNumberInput={handleNumberInput}
            onBackspace={handleBackspace}
            onCall={handleCall}
          />
        )}

        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="container mx-auto max-w-md px-4 py-3">
            <div className="flex justify-around items-center">
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
                <Phone className="h-5 w-5" />
                <span className="text-xs">Dialer</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
                <Clock className="h-5 w-5" />
                <span className="text-xs">Recent</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
                <Users className="h-5 w-5" />
                <span className="text-xs">Contacts</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1" onClick={() => navigate('/accounts')}>
                <Settings className="h-5 w-5" />
                <span className="text-xs">Accounts</span>
              </Button>
            </div>
          </div>
        </nav>

        <SIPConfigDialog
          open={showConfig}
          onOpenChange={setShowConfig}
          onConnected={handleConnected}
        />
      </div>
    </div>
  );
};

export default Dialer;

import { useState } from "react";
import Dialpad from "@/components/dialer/Dialpad";
import CallInterface from "@/components/dialer/CallInterface";
import { Button } from "@/components/ui/button";
import { Phone, Users, Clock, Settings } from "lucide-react";

const Dialer = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);

  const handleNumberInput = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (phoneNumber) {
      setIsInCall(true);
    }
  };

  const handleHangup = () => {
    setIsInCall(false);
    setPhoneNumber("");
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SIP Dialer
          </h1>
          <p className="text-muted-foreground mt-1">Connected to AlienVoIP</p>
        </header>

        {isInCall ? (
          <CallInterface
            phoneNumber={phoneNumber}
            onHangup={handleHangup}
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
              <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
                <Settings className="h-5 w-5" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Dialer;

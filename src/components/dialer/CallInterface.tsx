import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Mic, MicOff, Volume2, VolumeX, MoreVertical } from "lucide-react";

interface CallInterfaceProps {
  phoneNumber: string;
  onHangup: () => void;
}

const CallInterface = ({ phoneNumber, onHangup }: CallInterfaceProps) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 pb-24">
      <Card className="bg-card/50 backdrop-blur-sm border-border p-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse-slow">
            <Phone className="h-12 w-12 text-primary" />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {phoneNumber}
            </h2>
            <p className="text-muted-foreground mt-2">Connected</p>
          </div>

          <div className="text-lg font-mono text-primary">
            {formatDuration(duration)}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6 px-4">
        <Button
          variant="secondary"
          className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-primary/20"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
          <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
        </Button>

        <Button
          variant="secondary"
          className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-primary/20"
          onClick={() => setIsSpeaker(!isSpeaker)}
        >
          {isSpeaker ? (
            <Volume2 className="h-6 w-6" />
          ) : (
            <VolumeX className="h-6 w-6" />
          )}
          <span className="text-xs">Speaker</span>
        </Button>

        <Button
          variant="secondary"
          className="h-16 flex flex-col items-center justify-center gap-2 hover:bg-primary/20"
        >
          <MoreVertical className="h-6 w-6" />
          <span className="text-xs">More</span>
        </Button>
      </div>

      <div className="flex justify-center px-4">
        <Button
          className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          onClick={onHangup}
        >
          <Phone className="h-6 w-6 rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
};

export default CallInterface;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, Delete } from "lucide-react";

interface DialpadProps {
  phoneNumber: string;
  onNumberInput: (digit: string) => void;
  onBackspace: () => void;
  onCall: () => void;
}

const dialpadButtons = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

const Dialpad = ({ phoneNumber, onNumberInput, onBackspace, onCall }: DialpadProps) => {
  return (
    <div className="space-y-6 pb-24">
      <Card className="bg-card/50 backdrop-blur-sm border-border p-6">
        <div className="text-center min-h-[60px] flex items-center justify-center">
          <span className="text-3xl font-light tracking-wider text-foreground">
            {phoneNumber || "Enter number"}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4 px-2">
        {dialpadButtons.map((button) => (
          <Button
            key={button.digit}
            variant="secondary"
            className="h-16 flex flex-col items-center justify-center hover:bg-primary/20 transition-all duration-200 active:scale-95"
            onClick={() => onNumberInput(button.digit)}
          >
            <span className="text-2xl font-semibold">{button.digit}</span>
            {button.letters && (
              <span className="text-xs text-muted-foreground tracking-wider">
                {button.letters}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="flex gap-4 px-2 items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={onBackspace}
          disabled={!phoneNumber}
        >
          <Delete className="h-5 w-5" />
        </Button>
        
        <Button
          className="h-16 w-16 rounded-full bg-success hover:bg-success/90 text-success-foreground shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
          onClick={onCall}
          disabled={!phoneNumber}
        >
          <Phone className="h-6 w-6" />
        </Button>
        
        <div className="h-14 w-14" />
      </div>
    </div>
  );
};

export default Dialpad;

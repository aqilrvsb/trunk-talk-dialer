import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Settings, Trash2 } from "lucide-react";
import { SIPAccount } from "@/lib/externalSupabase";

interface AccountCardProps {
  account: SIPAccount;
  onConnect: (account: SIPAccount) => void;
  onEdit: (account: SIPAccount) => void;
  onDelete: (account: SIPAccount) => void;
}

const AccountCard = ({ account, onConnect, onEdit, onDelete }: AccountCardProps) => {
  return (
    <Card className="p-4 bg-card hover:bg-card/80 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{account.account_name}</h3>
          {account.phone_number && (
            <p className="text-sm text-muted-foreground">{account.phone_number}</p>
          )}
        </div>
        <Badge variant={account.is_connected ? "default" : "secondary"}>
          {account.is_connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>
      
      <div className="space-y-1 mb-4 text-sm text-muted-foreground">
        <p>Server: {account.sip_server}</p>
        <p>Username: {account.sip_username}</p>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={() => onConnect(account)}
          disabled={account.is_connected}
          className="flex-1"
          size="sm"
        >
          <Phone className="h-4 w-4 mr-1" />
          Connect
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(account)}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(account)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default AccountCard;

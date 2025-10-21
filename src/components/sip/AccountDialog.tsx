import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SIPAccount } from "@/lib/externalSupabase";
import { Loader2 } from "lucide-react";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: Partial<SIPAccount>) => Promise<void>;
  account?: SIPAccount;
}

const AccountDialog = ({ open, onOpenChange, onSave, account }: AccountDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_name: "",
    sip_server: "",
    sip_username: "",
    sip_password: "",
    display_name: "",
    phone_number: "",
  });

  useEffect(() => {
    if (account) {
      setFormData({
        account_name: account.account_name,
        sip_server: account.sip_server,
        sip_username: account.sip_username,
        sip_password: account.sip_password,
        display_name: account.display_name || "",
        phone_number: account.phone_number || "",
      });
    } else {
      setFormData({
        account_name: "",
        sip_server: "",
        sip_username: "",
        sip_password: "",
        display_name: "",
        phone_number: "",
      });
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? "Edit" : "Add"} SIP Account</DialogTitle>
          <DialogDescription>
            Configure your SIP account credentials
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                id="account_name"
                required
                value={formData.account_name}
                onChange={(e) =>
                  setFormData({ ...formData, account_name: e.target.value })
                }
                placeholder="My SIP Account"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sip_server">SIP Server *</Label>
              <Input
                id="sip_server"
                required
                value={formData.sip_server}
                onChange={(e) =>
                  setFormData({ ...formData, sip_server: e.target.value })
                }
                placeholder="sip.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sip_username">Username *</Label>
              <Input
                id="sip_username"
                required
                value={formData.sip_username}
                onChange={(e) =>
                  setFormData({ ...formData, sip_username: e.target.value })
                }
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sip_password">Password *</Label>
              <Input
                id="sip_password"
                type="password"
                required
                value={formData.sip_password}
                onChange={(e) =>
                  setFormData({ ...formData, sip_password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                placeholder="+1234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {account ? "Update" : "Add"} Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDialog;

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SIPAccount } from "@/lib/externalSupabase";
import AccountCard from "@/components/sip/AccountCard";
import AccountDialog from "@/components/sip/AccountDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Accounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<SIPAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SIPAccount | undefined>();
  const [deleteAccount, setDeleteAccount] = useState<SIPAccount | undefined>();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    try {
      const stored = localStorage.getItem('sip_accounts');
      if (stored) {
        setAccounts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load SIP accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (accountData: Partial<SIPAccount>) => {
    try {
      let updatedAccounts: SIPAccount[];
      
      if (editingAccount) {
        // Update existing account
        updatedAccounts = accounts.map(acc => 
          acc.id === editingAccount.id 
            ? { ...acc, ...accountData, updated_at: new Date().toISOString() }
            : acc
        );

        toast({
          title: "Success",
          description: "Account updated successfully",
        });
      } else {
        // Create new account
        const newAccount: SIPAccount = {
          id: crypto.randomUUID(),
          user_id: '',
          account_name: accountData.account_name || '',
          sip_server: accountData.sip_server || '',
          sip_username: accountData.sip_username || '',
          sip_password: accountData.sip_password || '',
          display_name: accountData.display_name || null,
          phone_number: accountData.phone_number || null,
          is_connected: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        updatedAccounts = [...accounts, newAccount];

        toast({
          title: "Success",
          description: "Account added successfully",
        });
      }

      localStorage.setItem('sip_accounts', JSON.stringify(updatedAccounts));
      setAccounts(updatedAccounts);
      setShowDialog(false);
      setEditingAccount(undefined);
    } catch (error) {
      console.error('Error saving account:', error);
      toast({
        title: "Error",
        description: "Failed to save account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleConnect = (account: SIPAccount) => {
    // Store selected account and navigate to dialer
    localStorage.setItem('selected_sip_account', JSON.stringify(account));
    window.location.href = '/';
  };

  const handleEdit = (account: SIPAccount) => {
    setEditingAccount(account);
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteAccount) return;

    try {
      const updatedAccounts = accounts.filter(acc => acc.id !== deleteAccount.id);
      localStorage.setItem('sip_accounts', JSON.stringify(updatedAccounts));
      setAccounts(updatedAccounts);

      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeleteAccount(undefined);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SIP Accounts
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your SIP accounts
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Account
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No SIP accounts yet</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onConnect={handleConnect}
                onEdit={handleEdit}
                onDelete={setDeleteAccount}
              />
            ))}
          </div>
        )}

        <AccountDialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) setEditingAccount(undefined);
          }}
          onSave={handleSave}
          account={editingAccount}
        />

        <AlertDialog 
          open={!!deleteAccount} 
          onOpenChange={(open) => !open && setDeleteAccount(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteAccount?.account_name}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Accounts;

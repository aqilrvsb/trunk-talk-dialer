import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { externalSupabase, SIPAccount } from "@/lib/externalSupabase";
import AccountCard from "@/components/sip/AccountCard";
import AccountDialog from "@/components/sip/AccountDialog";
import AuthGate from "@/components/auth/AuthGate";
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

  const loadAccounts = async () => {
    try {
      const { data: { user } } = await externalSupabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage SIP accounts",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await externalSupabase
        .from('sip_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
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
      const { data: { user } } = await externalSupabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingAccount) {
        const { error } = await externalSupabase
          .from('sip_accounts')
          .update(accountData)
          .eq('id', editingAccount.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Account updated successfully",
        });
      } else {
        const { error } = await externalSupabase
          .from('sip_accounts')
          .insert([{ ...accountData, user_id: user.id }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Account added successfully",
        });
      }

      loadAccounts();
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
      const { error } = await externalSupabase
        .from('sip_accounts')
        .delete()
        .eq('id', deleteAccount.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account deleted successfully",
      });

      loadAccounts();
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
    <AuthGate>
      <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SIP Accounts
            </h1>
            <p className="text-muted-foreground mt-1">Manage your SIP accounts</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </header>

        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No SIP accounts configured</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        <AlertDialog open={!!deleteAccount} onOpenChange={() => setDeleteAccount(undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteAccount?.account_name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </div>
    </AuthGate>
  );
};

export default Accounts;

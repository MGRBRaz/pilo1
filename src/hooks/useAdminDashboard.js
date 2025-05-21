import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchClientsFromDB, 
  addClientToDB, 
  updateClientInDB, 
  deleteClientFromDB,
  saveContentToProcessDB
} from '@/services/clientService';

const useAdminDashboard = () => {
  const [clients, setClients] = useState([]);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [isEditContentDialogOpen, setIsEditContentDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const fetchedClients = await fetchClientsFromDB();
      setClients(fetchedClients);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao buscar clientes", description: error.message });
      setClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClients();
    
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (storedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else if (prefersDark) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, [fetchClients]);

  const handleAddClient = async (newClientData) => {
    if (!newClientData.name || !newClientData.username || !newClientData.password || !newClientData.email) {
      toast({ variant: "destructive", title: "Erro ao adicionar cliente", description: "Nome, usuário, e-mail e senha são obrigatórios." });
      return;
    }
    try {
      const addedClient = await addClientToDB(newClientData);
      if (addedClient) {
        toast({ title: "Cliente Adicionado", description: `${addedClient.name} foi adicionado com sucesso.`, className: "bg-background text-foreground border-border" });
        fetchClients();
        setIsAddClientDialogOpen(false);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao adicionar cliente", description: error.message });
    }
  };

  const openEditClientDialog = (client) => {
    setSelectedClient(client);
    setIsEditClientDialogOpen(true);
  };

  const handleUpdateClient = async (updatedClientData) => {
    if (!selectedClient) return;
    if (!updatedClientData.name || !updatedClientData.username || !updatedClientData.email) {
       toast({ variant: "destructive", title: "Erro ao atualizar cliente", description: "Nome, e-mail e usuário são obrigatórios." });
      return;
    }
    try {
      const { user: updatedUser, passwordWarning } = await updateClientInDB(selectedClient.id, selectedClient.auth_id, updatedClientData);
      if (updatedUser) {
        toast({ title: "Cliente Atualizado", description: `${updatedUser.name} foi atualizado com sucesso.`, className: "bg-background text-foreground border-border" });
        if (passwordWarning) {
          toast({ title: "Aviso de Senha", description: passwordWarning, variant: "default", duration: 7000 });
        }
        fetchClients();
        setIsEditClientDialogOpen(false);
        setSelectedClient(null);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao atualizar cliente", description: error.message });
    }
  };
  
  const handleDeleteClient = async (clientId) => {
    const clientToDelete = clients.find(c => c.id === clientId);
    if (!clientToDelete) return;
    try {
      const { authDeletionWarning } = await deleteClientFromDB(clientId, clientToDelete.auth_id);
      toast({ title: "Cliente Removido", description: `${clientToDelete.name || 'Cliente'} foi removido com sucesso.`, className: "bg-background text-foreground border-border" });
      if (authDeletionWarning) {
        toast({ title: "Aviso de Autenticação", description: authDeletionWarning, variant: "default", duration: 7000 });
      }
      fetchClients();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao remover cliente", description: error.message });
    }
  };

  const openEditContentDialog = (client) => {
    setSelectedClient(client);
    setIsEditContentDialogOpen(true);
  };

  const handleSaveContent = async (newContent) => {
    if (!selectedClient) return;
    try {
      await saveContentToProcessDB(selectedClient.id, newContent);
      toast({ title: "Conteúdo Atualizado", description: `Conteúdo para ${selectedClient.name} atualizado com sucesso.`, className: "bg-background text-foreground border-border" });
      fetchClients(); // Refresh list to show updated content status potentially
      setIsEditContentDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao salvar conteúdo", description: error.message });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  return {
    clients,
    isAddClientDialogOpen,
    setIsAddClientDialogOpen,
    isEditClientDialogOpen,
    setIsEditClientDialogOpen,
    isEditContentDialogOpen,
    setIsEditContentDialogOpen,
    selectedClient,
    isDarkMode,
    isLoadingClients,
    handleAddClient,
    openEditClientDialog,
    handleUpdateClient,
    handleDeleteClient,
    openEditContentDialog,
    handleSaveContent,
    toggleDarkMode,
  };
};

export default useAdminDashboard;
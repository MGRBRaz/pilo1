import React from 'react';
import { Button } from '@/components/ui/button';
import AddClientDialog from '@/components/admin/AddClientDialog';
import EditClientDialog from '@/components/admin/EditClientDialog';
import EditContentDialog from '@/components/admin/EditContentDialog';
import ClientTable from '@/components/admin/ClientTable';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { PlusCircle, Users, LogOut, Sun, Moon } from 'lucide-react';
import useAdminDashboard from '@/hooks/useAdminDashboard';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const {
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
  } = useAdminDashboard();

  if (isLoadingClients) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="mt-4 text-lg">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 50 }}
        className="bg-card shadow-lg sticky top-0 z-50 border-b border-border"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Admin: <strong className="text-primary">{user?.name}</strong></span>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="button-ghost-themed">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} className="button-ghost-themed">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-border"
        >
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <Users className="mr-3 h-8 w-8 text-jgr-gold-light" />
              Painel de Clientes
            </h1>
            <p className="text-muted-foreground">Gerencie os clientes e seus conteúdos personalizados.</p>
          </div>
          <Button onClick={() => setIsAddClientDialogOpen(true)} className="button-primary-themed">
            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Cliente
          </Button>
        </motion.div>

        <AddClientDialog
          isOpen={isAddClientDialogOpen}
          onOpenChange={setIsAddClientDialogOpen}
          onAddClient={handleAddClient}
          initialData={{ name: '', username: '', email: '', password: '' }}
        />

        {selectedClient && (
          <EditClientDialog
            isOpen={isEditClientDialogOpen}
            onOpenChange={setIsEditClientDialogOpen}
            onEditClient={handleUpdateClient}
            clientData={selectedClient}
          />
        )}

        {selectedClient && (
          <EditContentDialog
            isOpen={isEditContentDialogOpen}
            onOpenChange={setIsEditContentDialogOpen}
            onSaveContent={handleSaveContent}
            clientName={selectedClient.name}
            initialContent={selectedClient.content || ''}
          />
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <ClientTable 
            clients={clients} 
            onEditClient={openEditClientDialog}
            onDeleteClient={handleDeleteClient}
            onUpdateContent={openEditContentDialog}
          />
        </motion.div>
      </main>

      <motion.footer 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 50, delay: 0.3 }}
        className="py-6 text-center bg-card border-t border-border"
      >
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} JGR BROKER. Todos os direitos reservados.
        </p>
      </motion.footer>
    </div>
  );
};

export default AdminDashboard;
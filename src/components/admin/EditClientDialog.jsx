
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const EditClientDialog = ({ isOpen, onOpenChange, onEditClient, clientData }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });

  useEffect(() => {
    if (clientData && isOpen) {
      setFormData({
        name: clientData.name || '',
        username: clientData.username || '',
        email: clientData.email || '',
        password: '', // Password field is empty by default for editing
      });
    }
  }, [clientData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.username || !formData.email) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome, usuário e e-mail são obrigatórios.",
      });
      return;
    }
    onEditClient(formData);
    // onOpenChange(false); // Parent handles dialog close on success
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Cliente: {clientData?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-muted-foreground">Nome</Label>
            <Input 
              id="edit-name" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="Nome do cliente"
              className="input-themed" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-username" className="text-muted-foreground">Usuário</Label>
            <Input 
              id="edit-username" 
              name="username" 
              value={formData.username} 
              onChange={handleInputChange} 
              placeholder="Nome de usuário para login" 
              className="input-themed"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-muted-foreground">E-mail</Label>
            <Input 
              id="edit-email" 
              name="email"
              type="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="E-mail do cliente" 
              className="input-themed"
              disabled
            />
            <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado após a criação (para manter a integridade com o login Supabase).</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password" className="text-muted-foreground">Nova Senha (opcional)</Label>
            <Input 
              id="edit-password" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              placeholder="Deixe em branco para manter a senha atual" 
              className="input-themed"
              autoComplete="new-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="button-outline-themed">Cancelar</Button>
          <Button onClick={handleSubmit} className="button-primary-themed">Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const AddClientDialog = ({ isOpen, onOpenChange, onAddClient, initialData }) => {
  const { toast } = useToast();
  
  const getInitialFormData = () => {
    return initialData && typeof initialData === 'object' 
      ? { 
          name: initialData.name || '', 
          username: initialData.username || '', 
          email: initialData.email || '',
          password: initialData.password || '' 
        }
      : { name: '', username: '', email: '', password: '' };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.username || !formData.password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, usuário e senha. E-mail é opcional.",
      });
      return;
    }
    onAddClient(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="add-name" className="text-muted-foreground">Nome</Label>
            <Input 
              id="add-name" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="Nome do cliente" 
              className="input-themed"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-username" className="text-muted-foreground">Usuário</Label>
            <Input 
              id="add-username" 
              name="username" 
              value={formData.username} 
              onChange={handleInputChange} 
              placeholder="Nome de usuário para login" 
              className="input-themed"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-email" className="text-muted-foreground">E-mail (Opcional)</Label>
            <Input 
              id="add-email" 
              name="email"
              type="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="E-mail do cliente" 
              className="input-themed"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-password" className="text-muted-foreground">Senha</Label>
            <Input 
              id="add-password" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              placeholder="Senha para login" 
              className="input-themed"
              autoComplete="new-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="button-outline-themed">Cancelar</Button>
          <Button onClick={handleSubmit} className="button-primary-themed">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;

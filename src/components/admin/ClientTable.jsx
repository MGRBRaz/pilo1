import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, FileText, Trash } from 'lucide-react';

const ClientTable = ({ clients, onEditClient, onUpdateContent, onDeleteClient }) => {
  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum cliente cadastrado. Adicione seu primeiro cliente.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border">
          <TableHead className="text-primary">Nome</TableHead>
          <TableHead className="text-primary">Usuário</TableHead>
          <TableHead className="text-primary">Conteúdo</TableHead>
          <TableHead className="text-primary text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id} className="border-border/50 hover:bg-muted/50">
            <TableCell className="text-foreground">{client.name}</TableCell>
            <TableCell className="text-foreground">{client.username}</TableCell>
            <TableCell className="text-foreground">
              {client.content ? (
                <span className="text-green-500 dark:text-green-400">Configurado</span>
              ) : (
                <span className="text-yellow-500 dark:text-yellow-400">Não configurado</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEditClient(client)}
                  className="button-ghost-themed"
                  aria-label={`Editar cliente ${client.name}`}
                >
                  <User className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onUpdateContent(client)}
                  className="button-ghost-themed"
                  aria-label={`Editar conteúdo de ${client.name}`}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDeleteClient(client.id)}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  aria-label={`Excluir cliente ${client.name}`}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientTable;
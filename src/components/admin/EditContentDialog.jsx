
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { X, UploadCloud, FileText } from 'lucide-react';

const EditContentDialog = ({ isOpen, onOpenChange, onSaveContent, clientName, initialContent }) => {
  const [htmlContent, setHtmlContent] = useState(initialContent || '');
  const [fileName, setFileName] = useState('');
  const [processingError, setProcessingError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setHtmlContent(initialContent || '');
      setFileName('');
      setProcessingError('');
    }
  }, [isOpen, initialContent]);

  const processHtmlContent = (htmlString) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');

      let head = doc.querySelector('head');
      if (!head) {
        head = doc.createElement('head');
        doc.documentElement.insertBefore(head, doc.body);
      }

      let baseTag = head.querySelector('base');
      if (!baseTag) {
        baseTag = doc.createElement('base');
        const firstMetaCharset = head.querySelector('meta[charset]');
        if (firstMetaCharset) {
          firstMetaCharset.after(baseTag);
        } else {
          head.prepend(baseTag);
        }
      }
      baseTag.setAttribute('href', './');

      const styleTagId = 'horizons-injected-styles';
      let styleTag = head.querySelector(`#${styleTagId}`);
      if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.id = styleTagId;
        styleTag.textContent = `
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            /* height: 100%; Ensure body can grow with content */
            min-height: 100%; 
            overflow-x: hidden; /* Prevent horizontal scroll on body, manage internally */
            overflow-y: auto; 
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          }
          * {
            box-sizing: border-box;
          }
          body > *:first-child {
            margin-top: 0;
          }
          img {
            max-width: 100%;
            height: auto;
            display: block;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto; 
          }
          th, td {
            padding: 8px; 
            border: 1px solid #ddd; 
            text-align: left; 
            word-wrap: break-word; 
          }
          thead th {
            position: -webkit-sticky; 
            position: sticky;
            top: 0;
            background-color: #f8f9fa; 
            z-index: 10; 
            outline: 1px solid #dee2e6; 
          }
          .horizons-table-container {
            width: 100%;
            max-height: 90vh; 
            overflow: auto; 
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            margin-bottom: 1rem; /* Add some space below table container */
          }
          /* Ensure clickable elements are obvious */
          [onclick], button, a[href], input[type="button"], input[type="submit"], input[type="reset"] {
            cursor: pointer;
          }
        `;
        head.appendChild(styleTag);
      }
      
      const tables = doc.querySelectorAll('body table');
      tables.forEach(table => {
        if (table.parentElement && !table.parentElement.classList.contains('horizons-table-container')) {
          const tableContainer = doc.createElement('div');
          tableContainer.className = 'horizons-table-container';
          table.parentNode.insertBefore(tableContainer, table);
          tableContainer.appendChild(table);
        }
      });


      const serializer = new XMLSerializer();
      let processedHtml = serializer.serializeToString(doc);
      
      if (!processedHtml.toLowerCase().startsWith('<!doctype html>')) {
        processedHtml = '<!DOCTYPE html>\n' + processedHtml;
      }
      
      setProcessingError('');
      return processedHtml;

    } catch (error) {
      console.error("Error processing HTML:", error);
      setProcessingError(`Erro ao processar HTML: ${error.message}. O conteúdo original será usado.`);
      return htmlString; 
    }
  };


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawHtml = e.target.result;
        const processedHtml = processHtmlContent(rawHtml);
        setHtmlContent(processedHtml);
        setFileName(file.name);
        if (!processingError) { 
          toast({
            title: "Arquivo Processado",
            description: "O arquivo HTML foi processado para melhor visualização.",
            variant: "default",
          });
        }
      };
      reader.readAsText(file);
    } else {
      setHtmlContent(initialContent || '');
      setFileName('');
      toast({
        title: 'Arquivo Inválido',
        description: 'Por favor, selecione um arquivo .html.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!htmlContent.trim()) {
      toast({
        title: 'Conteúdo Vazio',
        description: 'Não é possível salvar conteúdo vazio. Por favor, anexe um arquivo HTML.',
        variant: 'destructive',
      });
      return;
    }
    onSaveContent(htmlContent);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl glass-card text-foreground p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-6 pb-4 bg-card/50 rounded-t-lg">
            <DialogTitle className="text-2xl text-primary flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Editar Conteúdo HTML para {clientName}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Anexe um novo arquivo HTML. O sistema tentará otimizar o arquivo para melhor visualização e funcionalidade.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="htmlFile" className="text-primary">Arquivo HTML</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="htmlFile"
                  type="file"
                  accept=".html"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="button-secondary-themed flex-grow justify-start text-left"
                  onClick={() => document.getElementById('htmlFile')?.click()}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {fileName || 'Clique para selecionar um arquivo...'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                O arquivo anexado substituirá o conteúdo existente.
              </p>
              {processingError && (
                <p className="text-xs text-destructive mt-1">{processingError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-primary">Pré-visualização do Conteúdo (HTML Processado)</Label>
              <div className="w-full h-64 border border-border rounded-md overflow-auto bg-background/30 p-2">
                {htmlContent ? (
                  <iframe
                    srcDoc={htmlContent}
                    title="Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Nenhum conteúdo para pré-visualizar.</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Esta é uma pré-visualização do HTML que será salvo.
              </p>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 bg-card/50 rounded-b-lg flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="button-secondary-themed w-full sm:w-auto">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="button-primary-themed w-full sm:w-auto">
              Salvar Conteúdo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentDialog;

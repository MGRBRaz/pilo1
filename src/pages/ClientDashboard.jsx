
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { LogOut, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const [clientContent, setClientContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const iframeRef = useRef(null);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    const fetchClientContent = async () => {
      if (user?.id) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('processes')
          .select('html_content')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching client content:', error);
          toast({ variant: "destructive", title: "Erro ao buscar conteúdo", description: error.message });
          setClientContent('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:red;"><p>Erro ao carregar conteúdo. Tente novamente mais tarde.</p></body></html>');
        } else if (data && data.html_content) {
          setClientContent(data.html_content);
        } else {
          setClientContent('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#666;"><p>Nenhum conteúdo disponível no momento.</p></body></html>');
        }
        setIsLoading(false);
      } else if (!user) {
        setIsLoading(false);
        setClientContent('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#666;"><p>Usuário não encontrado. Faça login novamente.</p></body></html>');
      }
    };

    if (user) {
      fetchClientContent();
    } else {
      setIsLoading(false);
      setClientContent('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#666;"><p>Sessão não encontrada. Faça login.</p></body></html>');
    }
  }, [user, toast]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && clientContent) {
      iframe.srcdoc = clientContent;
    } else if (iframe) {
      iframe.srcdoc = '<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;color:#666;"><p>Carregando...</p></body></html>';
    }
  }, [clientContent]);


  const headerVariants = {
    scrolled: {
      backgroundColor: 'hsla(var(--card) / 0.5)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
      borderColor: 'hsla(var(--border) / 0.3)',
      transition: { type: 'tween', duration: 0.3 }
    },
    top: {
      backgroundColor: 'hsla(var(--background) / 0.8)',
      backdropFilter: 'blur(0px)',
      boxShadow: 'none',
      borderColor: 'hsla(var(--border) / 0)',
      transition: { type: 'tween', duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background text-foreground flex flex-col">
      <motion.header
        variants={headerVariants}
        animate={isHeaderScrolled ? "scrolled" : "top"}
        className="sticky top-0 z-50 border-b"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline">
              Cliente: <strong className="text-primary">{user?.name || 'Carregando...'}</strong>
            </span>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="button-ghost-themed">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" onClick={logout} className="button-outline-themed text-xs sm:text-sm">
              <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Sair
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex-grow flex flex-col"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-grow">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
              <p className="text-lg text-muted-foreground">Carregando seu conteúdo...</p>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              title="Conteúdo do Cliente"
              className="w-full h-full flex-grow border-0 rounded-xl shadow-xl bg-card"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-pointer-lock"
            />
          )}
        </motion.div>
      </main>
      
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="py-6 text-center bg-card/50 backdrop-blur-sm border-t border-border/30 mt-auto"
      >
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} JGR BROKER. Todos os direitos reservados.
        </p>
      </motion.footer>
    </div>
  );
};

export default ClientDashboard;

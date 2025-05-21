import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const loggedInUser = await login(username, password);

      if (loggedInUser) {
        toast({
          title: 'Login bem-sucedido!',
          description: `Bem-vindo, ${loggedInUser.name}!`,
          className: "bg-background text-foreground border-border",
        });
        if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/client');
        }
      } else {
        // The login service or context now handles specific error toasts for "useEmail"
        // Generic failure message if not handled by login service
        const isEmailLoginError = username.includes('@'); // Simple check, might need refinement
        if (!isEmailLoginError && username !== 'admin') {
           // This toast might be redundant if authService.loginUser already shows a specific one for "useEmail"
        } else if (username !== 'admin') {
           // This toast might be redundant if authService.loginUser already shows a specific one for "useEmail"
        }
        
        // General fallback if no specific toast was shown by login function
        if (!toast.isActive('login-failure')) { // Check if a specific toast was already shown
            toast({
              id: 'login-failure', // Prevents duplicate generic messages if specific one was shown
              title: 'Falha no Login',
              description: 'Login ou senha inválidos. Caso o erro persista, entre em contato com o suporte.',
              variant: 'destructive',
            });
        }
      }
    } catch (error) {
      console.error("Erro inesperado durante o login:", error);
      toast({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl bg-card border-border overflow-hidden">
          <CardHeader className="text-center p-8 bg-secondary/30">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-6"
            >
              <Logo size="lg" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-primary">Bem-vindo de volta!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse o portal JGR Broker para visualizar seus processos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">Usuário ou E-mail</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu usuário ou e-mail"
                  required
                  className="input-themed"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="input-themed pr-10"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 px-0 button-ghost-themed"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full button-primary-themed" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="p-6 bg-secondary/30">
            <p className="text-xs text-muted-foreground text-center w-full">
              © {new Date().getFullYear()} JGR BROKER. Todos os direitos reservados.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
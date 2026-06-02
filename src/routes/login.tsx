import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso Restrito — Ouvidoria Hospitalar" },
      { name: "description", content: "Faça login para acessar o painel de manifestações da Ouvidoria." },
    ],
  }),
  component: LoginComponent,
});

function LoginComponent() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated === true) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning("Preencha todos os campos!");
      return;
    }

    setIsSubmitting(true);
    // Simular um atraso de carregamento sutil para micro-animação premium
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = login(username, password);
    setIsSubmitting(false);

    if (success) {
      toast.success("Acesso autorizado! Bem-vindo.", {
        description: "Redirecionando para o painel analítico...",
      });
      // Pequeno delay para exibir o toast antes de navegar
      setTimeout(() => {
        navigate({ to: "/" });
      }, 500);
    } else {
      toast.error("Usuário ou senha incorretos.", {
        description: "Por favor, verifique suas credenciais.",
      });
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50/50 p-4 dark:bg-slate-950/50">
      {/* Círculos de Background com Gradiente Moderno e Blur */}
      <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-[120px] pointer-events-none dark:bg-primary/5" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-accent/20 blur-[120px] pointer-events-none dark:bg-accent/5" />

      <div className="z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 animate-pulse">
            <Activity className="h-6 w-6" strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ouvidoria Hospitalar</h1>
            <p className="text-sm text-muted-foreground mt-1">Painel Analítico e Operacional</p>
          </div>
        </div>

        <Card className="border-border bg-card/60 backdrop-blur-xl shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Acesso Restrito</CardTitle>
            <CardDescription>
              Insira suas credenciais administrativas para continuar.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="username">
                  Usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="ex: admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9 h-10 border-input bg-background/50 focus:bg-background transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="password">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="pl-9 pr-10 h-10 border-input bg-background/50 focus:bg-background transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all duration-300 shadow-md shadow-primary/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Entrar no Painel"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Acesso exclusivo para colaboradores autorizados do setor de Ouvidoria.
        </p>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

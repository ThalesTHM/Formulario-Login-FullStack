"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { loginFormSchema } from '@/lib/validation';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { getCurrentTry } from '@/lib/actions';
import LoginFormSkeleton from '@/components/login/LoginFormSkeleton';
import { useActionState } from 'react'; // adjust import if different source

const THIRTY_SECONDS = 30 * 1000;
const MAX_TRIES = 3;

const Login = () => {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const timeLeft = useRef(THIRTY_SECONDS);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_loginState, formAction, isPending] = useActionState(handleLogin, {
    error: '',
    status: 'INITIAL',
  });

  useEffect(() => {
    getCurrentTry().then(res => {
      if (!res.success) {
        return;
      } else {
        if(res.response.tries as number < MAX_TRIES) {
          setIsLoading(false);  
          return;
        }

        const lastTryTime = res.response.lastTry?.getTime() ?? 0;
        const diff = Date.now() - lastTryTime;

        if (diff < THIRTY_SECONDS) {
          timeLeft.current = THIRTY_SECONDS - diff;

          console.log("Initial Time left:", timeLeft.current);

          resetTimeoutRef.current = setTimeout(() => {
            resetTimeoutRef.current = null;
            toast.info("Você pode tentar novamente agora.");
            timeLeft.current = THIRTY_SECONDS; 
          }, timeLeft.current);
        }
      }

      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoginFormSkeleton />;
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleLogin(prevState: any, formData: FormData) {
    try {
      setErrors({});
      const formValues = {
        username: formData.get("username") as string,
        password: formData.get("password") as string,
      };

      await loginFormSchema.parseAsync(formValues);

      const res = await signIn("credentials", {
        redirect: false,
        username: formValues.username,
        password: formValues.password,
      });

      if (res?.error) {
        console.log(res?.error);
        
        if(res?.error == "INVALID_CREDENTIALS"){
          toast.error("Usuário ou Senha Incorreto.");

          clearTimeout(resetTimeoutRef.current as NodeJS.Timeout);
          resetTimeoutRef.current = null;

          await getCurrentTry().then(res => {
            if(res.response.tries as number < MAX_TRIES) return;

            const lastTryTime = res.response.lastTry?.getTime() ?? 0;
            const diff = Date.now() - lastTryTime;
            console.log("Diff:", diff);
            
            console.log("condition: ", diff < THIRTY_SECONDS);
            
            if (diff < THIRTY_SECONDS) {
              timeLeft.current = THIRTY_SECONDS - diff;

              console.log("Current time left:", timeLeft.current);
              console.log("Button click Time left:", timeLeft.current);
      
              resetTimeoutRef.current = setTimeout(() => {
                resetTimeoutRef.current = null;
                toast.info("Você pode tentar novamente agora.");
                timeLeft.current = THIRTY_SECONDS;
                
              }, timeLeft.current);
            }
          })
        }
        
        if (res?.error == "TOO_MANY_TRIES") {
          toast.error("Muitas tentativas, tente novamente mais tarde.");
        }

        return { ...prevState, error: res?.error, status: "ERROR" };
      }

      toast.success("Logado com Sucesso!");
      router.push("/");
      return { ...prevState, error: "", status: "SUCCESS" };

    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as Record<string, string[]>);
        toast.error("Erro ao Logar, Verifique o Formulário para Erros de Escrita.");
        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast.error("Um erro não esperado ocorreu.");
      return { ...prevState, error: "An unexpected error has occurred", status: "ERROR" };
    }
  }

  return (
    <div className='main-auth-form-container'>
      <div className='auth-form-container'>
        <form action={formAction}>
          <div>
            <label htmlFor="username">Usuário</label>
            <Input id="username" name="username" placeholder='Usuário' required />
            {errors.username?.map((err, i) => (
              <p key={i} className="auth-form-error">{err}</p>
            ))}
          </div>

          <div className='mt-5'>
            <label htmlFor="password">Senha</label>
            <Input id="password" name="password" placeholder='senha' type="password" />
            {errors.password?.map((err, i) => (
              <p key={i} className="auth-form-error">{err}</p>
            ))}
          </div>

          <Button type='submit' className='auth-form-submit-button' disabled={isPending}>
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;

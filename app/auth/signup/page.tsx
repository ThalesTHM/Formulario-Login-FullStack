"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useActionState, useState } from 'react';
import { z } from 'zod';
import { signupFormSchema } from '@/lib/validation';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createUser } from '@/lib/actions';
import { signIn } from 'next-auth/react';

const Signup = () => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSignup = async (prevState: any, formData: FormData) => {
    try{
      setErrors({});

      const formValues = {
        username: formData.get("username") as string,
        password: formData.get("password") as string
      };

      await signupFormSchema.parseAsync(formValues);

      const resCreateUser = await createUser(formValues.username, formValues.password)

      if (!resCreateUser.success) {
        toast.error(resCreateUser.error)

        return {
          ... prevState, error: resCreateUser.error, status: "ERROR"
        }
      }

      toast.success("Cadastrado com Sucesso!");

      const resSignIn = await signIn("credentials", {
        username: formValues.username,
        password: formValues.password,
        redirect: false
      })

      if(resSignIn?.error || !resSignIn){
        toast.error("Erro ao logar, tente fazer isso manualmente.")

        return {
          ...prevState,
          error: "Login error",
          status: "ERROR",
        };
      }

      router.push("/");

      return {
        ...prevState,
        error: "",
        status: "SUCCESS",
      };
    } catch (error){
      if(error instanceof z.ZodError){
        const fieldErrors = error.flatten().fieldErrors;
        
        setErrors(fieldErrors as unknown as Record<string, string[]>);

        toast.error("Erro ao Cadastrar.");

        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }
    }

    toast.error("Um erro não esperado ocorreu.");

    return {
      ...prevState,
      error: "An unexpected error has occurred",
      status: "ERROR",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, formAction, isPending] = useActionState(handleSignup, {
    error: "",
    status: "INITIAL",
  });

  return (
    <div className='main-auth-form-container'>
      <div className='auth-form-container'>
        <form action={formAction}>
          <div>
            <label htmlFor="username">Usuario</label>
            <Input
              id="username"
              name="username"
              placeholder='Usuário'
              required
            />
            {errors.username && (
              errors.username.map((error: string, i: number) => (
              <>
                <div key={i}>
                  <p className="auth-form-error" key={i}>{error}</p> 
                  <br/>
                </div>
              </>
            )
            ))}
          </div>

          <div className='mt-5'>
            <label htmlFor="password">Senha</label>
            <Input
              id="password"
              name="password"
              placeholder='senha'
              type="password"
            />
            {errors.password && (
              errors.password.map((error: string, i: number) => (
                <>
                  <div key={i}>
                    <p className="auth-form-error" key={i}>{error}</p> 
                    <br/>
                  </div>
                </>
            )
            ))}
          </div>

          <Button 
            type='submit'
            className='auth-form-submit-button'
            disabled={isPending}
          >
            {isPending ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Signup
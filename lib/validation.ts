import { z } from 'zod';

export const signupFormSchema = z.object({
    username: z.string().min(1, { message: "Usuário Deve Ter No Mínimo 1 Caracter." }),
    password: z.string().min(8, { message: "Senha Deve Ter No Mínimo 8 Caracteres." })
      .refine((val) => /[A-Z]/.test(val), {
        message: "A Senha Deve Conter Pelo Menos Uma Letra Maiúscula.",
      })
      .refine((val) => /\d/.test(val), {
        message: "A Senha Deve Conter Pelo Menos Um Número.",
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: "A Senha Deve Conter Pelo Menos Um Caractere Especial.",
      })
})

export const loginFormSchema = z.object({
  username: z.string().min(6, { message: "Usuário Deve Ter No Mínimo 6 Caracteres." }),
  password: z.string().min(8, { message: "Senha Deve Ter No Mínimo 8 Caracteres." })
})